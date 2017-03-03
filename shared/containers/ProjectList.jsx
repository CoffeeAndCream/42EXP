import React from 'react';
import ProjectChip from '../components/ProjectChip';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {start_request,stop_request} from '../actions/loader'
import Modal from 'react-modal';
import ProjectForm from '../components/ProjectForm';
import create_project from '../actions/projects/create_project';

class ProjectList extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      project_list:[],
      show_jumbotron: true
    }
    this.dismiss_jumbotron = this.dismiss_jumbotron.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal(){
    this.setState({modalIsOpen:true})
  }

  closeModal(){
    this.setState({modalIsOpen:false})
  }

  fetchData(){
    this.props.start_request()
    socket.emit('project:list',{},function(err,data){
      if(err){
        this.props.stop_request()
      }else{
        this.props.stop_request()
        this.setState({project_list:data})
      }
    }.bind(this))
  }

  dismiss_jumbotron(){
    localStorage.setItem('new_user', false)
    this.setState({show_jumbotron: false})
  }

  componentDidMount(){
    if(socket){
      this.fetchData()
    }
    console.log('hello')
    let showJumbotron = localStorage.getItem('new_user')

    console.log('showJumbotron : ',showJumbotron)

    if(showJumbotron == 'undefined' || null){
      localStorage.setItem('new_user',true)
    }

    if (showJumbotron === "false"){
      this.setState({show_jumbotron: false})
    }
  }


  render(){
    return(
      <div className="project_list">
        {this.state.show_jumbotron ?
          <div className="jumbotron">
            <h2> New here ? </h2>
            <p> Welcome to 42exp. You can find a list of recent projects to join below. </p>
            <p> Be sure to fill up your profile with your up-to-date skillset for other users to look at</p>
            <p> Be sure to also visit the lobby chatroom if you have further questions </p>
            <button className="jumbotron__dismiss" onClick={this.dismiss_jumbotron}> Got it </button>
          </div>
          :
          null
        }
        <h3 className="project_list__header"> Recent Projects </h3>
        <div className="user_actions">
          <button className="user_actions__new_project" onClick={this.openModal}>
            New Project
          </button>
        </div>
      {
        this.state.project_list.length > 0 ?
          this.state.project_list.map((project) => {
            return (
              <Link to = {`/projects/${project.project_id}/${project.project_name}`} key={project.project_id}>
                <ProjectChip key={project.project_id} project = {project}/>
              </Link>
            )
          })
          :
          <h1> No projects yet! Signup to create one! </h1>
      }

      <Modal isOpen={this.state.modalIsOpen}
             onRequestClose={this.closeModal}
             className="new_project__form"
             overlayClassName="new_project" >
          <ProjectForm create_project={this.props.create_project} close={this.closeModal}/>
      </Modal>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    start_request,
    stop_request,
    create_project
  },dispatch)
}

const ProjectListContainer = connect(null,mapDispatchToProps)(ProjectList)

export default ProjectListContainer;
