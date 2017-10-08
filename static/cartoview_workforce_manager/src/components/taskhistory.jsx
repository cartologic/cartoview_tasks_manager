import React,  {Component}from 'react'; 
import Moment from 'react-moment'; 

export default class TaskHistroy extends Component {
constructor(props) {
super(props)
this.state = {
              taskhistory:[]
              }
this.loadTaskHistory()

}
loadTaskHistory = () =>  {
        // this.setState( {task:false})
        var url = '/apps/cartoview_workforce_manager/api/v1/history/?task__id=' + this.props.task.id 
                fetch(url,  {method:"GET", 
        headers:new Headers( {
        "Content-Type":"application/json; charset=UTF-8", 

        })
        })
        .then(function (response) {

        if (response.status >= 400) {
        throw new Error("Bad response from server"); 
        }
        return response.json(); 
        })
        .then((data) =>  {


        this.setState({taskhistory:data.objects})
        }); 


}
clearHistory=()=>{
        var url = '/apps/cartoview_workforce_manager/api/v1/history/?task__id=' + this.props.task.id 
        fetch(url,  {method:"DELETE", 
headers:new Headers( {
"Content-Type":"application/json; charset=UTF-8", 

})
})
.then(function (response) {

if (response.status >= 400) {
throw new Error("Bad response from server"); 
}
return response
})
.then((data) =>  {

this.loadTaskHistory()
}); 

}
render() {
        return ( 
        <div> 
                <div> <button className="btn btn-danger pull-right" onClick={this.clearHistory}> clear history</button>
           </div>
            <p>  &nbsp;- Task was created by {this.props.task.created_by.username} at < Moment  format = "DD/MM/YYYY"date =  {this.props.task.created_at}/></p>  
            {this.state.taskhistory.map ((history,i) =>  {
                if(history.text){
             return <p key={i}>  &nbsp;-  {history.text} </p > }
                 })} </div> )
        }
}
