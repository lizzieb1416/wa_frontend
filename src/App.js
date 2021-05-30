import React from 'react';
import './App.css';


class App extends React.Component {
  constructor(props){
    super(props);
      this.state = {
        todoList:[],
        activeItem:{
          id:null, 
          description:'',
          completed:false,
        },
        editing:false,
      }
      this.fetchTasks = this.fetchTasks.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.getCookie = this.getCookie.bind(this)


      this.startEdit = this.startEdit.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.strikeUnstrike = this.strikeUnstrike.bind(this)

      this.saveList = this.saveList.bind(this)
      this.loadList = this.loadList.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

  componentWillMount(){
    this.fetchTasks()
  }

  fetchTasks(){
    console.log('Fetching...')
    console.log(`${process.env.REACT_APP_PROXY_HOST}` + 'another')
    console.log(process.env.REACT_APP_PROXY_HOST + 'another')

    //fetch('http://localhost:5000/tasks/')
    fetch(process.env.REACT_APP_PROXY_HOST + 'tasks/')
    .then(response => response.json())
    .then(data => 
      this.setState({
        todoList:data.tasks
      })
      )
  }

  handleChange(e){
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState({
      activeItem:{
        ...this.state.activeItem,
        description:value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)

    var csrftoken = this.getCookie('csrftoken')

    //var url = 'http://127.0.0.1:5000/add/'
    var url = process.env.REACT_APP_PROXY_HOST + 'add/'

    if(this.state.editing == true){
      //url = `http://127.0.0.1:5000/update/${ this.state.activeItem.id}/`
      url = `${process.env.REACT_APP_PROXY_HOST}` + 'update/' + `${ this.state.activeItem.id}/`
      this.setState({
        editing:false
      })
    }



    fetch(url, {
      method:'POST',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
      body:JSON.stringify(this.state.activeItem)
    }).then((response)  => {
        this.fetchTasks()
        this.setState({
           activeItem:{
          id:null, 
          description:'',
          completed:false,
        }
        })
    }).catch(function(error){
      console.log('ERROR:', error)
    })

  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editing:true,
    })
  }


  deleteItem(task){
    var csrftoken = this.getCookie('csrftoken')

    //fetch(`http://127.0.0.1:5000/delete/${task.id}/`, {
    fetch(`${process.env.REACT_APP_PROXY_HOST}` + `delete/` + `${task.id}/`, {
      method:'DELETE',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response) =>{

      this.fetchTasks()
    })
  }


  strikeUnstrike(task){

    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `${process.env.REACT_APP_PROXY_HOST}` + `update/` + `${task.id}/`
    //var url = `http://127.0.0.1:5000/update/${task.id}/`

      fetch(url, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify({'completed': task.completed, 'description':task.description})
      }).then(() => {
        this.fetchTasks()
      })

    console.log('TASK:', task.completed)
  }

  saveList(e){
    console.log("Saving list...")
    var csrftoken = this.getCookie('csrftoken')

    //fetch(`http://127.0.0.1:5000/save/`, {
    fetch(`${process.env.REACT_APP_PROXY_HOST}` + `save/`, {
      method:'GET',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response) =>{
      this.fetchTasks()
    })
  }

  loadList(e){

    if (window.confirm('Are you sure you want to load the ancient to do list?')){
      console.log("Loading list...")
      var csrftoken = this.getCookie('csrftoken')
      
      //fetch(`http://127.0.0.1:5000/load/`, {
      fetch(`${process.env.REACT_APP_PROXY_HOST}` + `load/`, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
      }).then((response) => {
        this.fetchTasks()
      })
    }
    
  }

  render(){
    var tasks = this.state.todoList
    var self = this
    return(
        <div className="container">

          <div id="task-container">
              <div  id="form-wrapper">
                 <form onSubmit={this.handleSubmit}  id="form">
                    <div className="flex-wrapper">
                        <div style={{flex: 6}}>
                            <input onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItem.description} type="text" name="title" placeholder="Add task.." />
                         </div>

                         <div style={{flex: 1}}>
                            <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                          </div>
                      </div>
                </form>
             
              </div>

              <div  id="list-wrapper">         
                    {tasks.map(function(task, index){
                      return(
                          <div key={index} className="task-wrapper flex-wrapper">

                            <div onClick={() => self.strikeUnstrike(task)} style={{flex:7}}>

                                {task.completed == false ? (
                                    <span>{task.description}</span>

                                  ) : (

                                    <strike>{task.description}</strike>
                                  )}
  
                            </div>

                            <div style={{flex:1}}>
                                <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                            </div>

                            <div style={{flex:1}}>
                                <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark delete">-</button>
                            </div>

                          </div>
                        )
                    })}
              </div>
          
              <div id="save-load-wrapper">
                <div className="task-wrapper flex-wrapper buttons-wrapper">
            
                    <div style={{flex: 1}}>
                      <button onClick={self.saveList} className="btn btn-info">Save</button>
                    </div>

                    <div style={{flex: 1}}>
                      <button onClick={self.loadList} className="btn btn-warning">Load</button>
                    </div>

                </div>
              </div>


            </div>
         
        </div>
      )
  }
}



export default App;