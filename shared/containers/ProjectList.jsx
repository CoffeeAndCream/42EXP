import React from 'react';
import ProjectChip from '../components/ProjectChip';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal from 'react-modal';
import loader from '../components/Loader';
import Waypoint from 'react-waypoint';
import Select from 'react-select';
import { skillOptions } from '../utils/Autocomplete.js';
import _ from 'lodash';

// TO-DO : move ProjectList to Component Folder as we do not need to use redux
class ProjectList extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      project_list: [],
      show_jumbotron: true,
      isFetching: true,
      fetchMore: false,
      filterPinned: false,
      filterSkilled: "",
      search: false
    }
    this.dismiss_jumbotron = this.dismiss_jumbotron.bind(this);
    this.activateWayPoint = this.activateWayPoint.bind(this);
    this.changeFilters = this.changeFilters.bind(this);
  }

  fetchData(filterPinned){
    this.setState({ isFetching: true })
    socket.emit('project:list', filterPinned, function(err,data){
      if(err){
        //
      }else{
        let fetchMore = data.length >= 5 ? true : false
        this.setState({ project_list: data, isFetching: false, fetchMore})
      }
    }.bind(this))
  }

  handleChange(name,input) {

    if(input){
      this.setState({ [name]: input , search: true, isFetching: true})
      socket.emit('project:search_by_skill',{ skill: input.value}, function(err,data){
        if (err) {
          console.log('err : ',err)
        } else {
          let fetchMore = data.length >= 5 ? true : false
          this.setState({ project_list: data, isFetching: false, fetchMore})
        }
      }.bind(this))
    } else {
      this.fetchData({ filterPinned: this.state.filterPinned })
    }
  }

  activateWayPoint(){
    let project_list = this.state.project_list
    let lastId = project_list[project_list.length - 1].project_id

    let searchBySkill = this.state.search ? this.state.filterSkilled.value : null

    socket.emit('project:list_more',{ lastId, searchBySkill },function(err,data){
      if (err) {
        console.log('there was an error : ',err)
      } else {
        let newList = project_list.concat(data)
        let fetchMore = data.length == 10 ? true : false
        this.setState({ project_list : newList, fetchMore })
      }
    }.bind(this))
  }

  dismiss_jumbotron() {
    localStorage.setItem('new_user', false)
    this.setState({ show_jumbotron: false })
  }

  componentDidMount() {

    let filterPinned = localStorage.getItem('filterPinned')
    if (filterPinned === null) {
      filterPinned = false;
      localStorage.setItem('filterPinned', false)
    }
    if(filterPinned === 'true' || 'false'){
      filterPinned = JSON.parse(filterPinned)
      this.setState({ filterPinned })
    }

    const showJumbotron = localStorage.getItem('new_user')
    if (showJumbotron == 'undefined' || null) {
      localStorage.setItem('new_user',true)
    }
    if (showJumbotron === "false") {
      this.setState({ show_jumbotron: false })
    }


    if(socket) {
      this.fetchData({ filterPinned: filterPinned })
    }

  }

  handleBackClick(){
    this.setState({ search: false, filterSkilled: {} })
    this.fetchData({ filterPinned: this.state.filterPinned})
  }

  changeFilters(){
    let filterPinned = !this.state.filterPinned
    this.setState({ filterPinned })
    this.fetchData({ filterPinned })
    localStorage.setItem('filterPinned',filterPinned)
  }

  getFilterOptions(name,input,callback) {
    let opt;
    if(socket) {

      socket.emit(`${name}:suggestions`,{[name]:input},(err,data) => {
        opt = skillOptions(data)
        console.log('opt: ',opt)
        callback(null,{ options: opt, complete: true })
      })
    }
  }


  render(){
    if (this.state.isFetching) {
      return loader()
    }

    return (
      <div className="project_list">
        { this.state.show_jumbotron && this.props.isAuthenticated ?
          <div className="jumbotron">
            <h2> New here ? </h2>
            <p> Welcome to 42exp. You can find a list of recent projects to join below. </p>
            <p> Be sure to fill up your profile with your up-to-date skillset for other users to look at</p>
            <p> Be sure to also visit the lobby chatroom if you have further questions </p>

            <div className="actions">
              <Link className="actions__lobby" to="/projects/1/42exp/messages">Visit Lobby</Link>
              <Link className="actions__profile" to={`/user/${this.props.username}`}> Profile </Link>
              <button className="actions__dismiss" onClick={this.dismiss_jumbotron}> X </button>
            </div>

          </div>
          :
          null
        }

        {
          this.state.search ?
          <h3 className="project_list__header"> <span onClick={this.handleBackClick.bind(this)} className="ion-arrow-left-b back_button" alt="go back to main list">Back</span> {this.state.filterSkilled.value} Projects </h3>
          :
          <h3 className="project_list__header"> Recent Projects </h3>
        }

        <div className="project_list__filters">

          <div className="remove_pinned">
            <input type="checkbox"
              checked={ this.state.filterPinned }
              onChange={ this.changeFilters } />
              <span> Hide 42exp related projects </span>
          </div>

          <div className="skill_filter">
            <Select.Async name="skill_filter"
              placeholder="Filter via skill"
              loadOptions={ _.debounce(this.getFilterOptions.bind(this,'skill'),1000) }
              minimumInput={ 1 }
              onChange={this.handleChange.bind(this,'filterSkilled')}
              value={this.state.filterSkilled}
              autoload={ false }
              multi={ false }
              />
          </div>
        </div>

      {
        this.state.project_list.length > 0 ?
          this.state.project_list.map((project) => {
            return (
                <ProjectChip key={project.project_id} project={project} handleChange={this.handleChange.bind(this)}/>
            )
          })
          :
          <h1> No projects Found </h1>
      }
      {
        this.state.fetchMore ?
        <div className="project_list__fetch_more">
          <Waypoint onEnter={this.activateWayPoint}/>
          { loader() }
        </div>
        :
        null
      }
      </div>

    )
  }
}

// const mapStateToProps = (state) => {
//   const User = state.User
//   return { User }
// }

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    // start_request,
    // stop_request,
    // create_project
  },dispatch)
}

const ProjectListContainer = connect(null,mapDispatchToProps)(ProjectList)

export default ProjectListContainer;
