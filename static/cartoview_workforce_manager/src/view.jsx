import React from 'react';
import { render } from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import injectTapEventPlugin from 'react-tap-event-plugin';
import enLocaleData from 'react-intl/locale-data/en';
import './app.css';
import AddTask from './components/addTask';
import ProjectDetails from './components/ProjectDetails';
import MyTasks from './components/myTasks';
import { getCRSFToken } from './helpers/helpers.jsx'
import TaskDetails from './components/taskDetails.jsx'
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import ReactPaginate from 'react-paginate';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Avatar from 'material-ui/Avatar';
import List, { ListItem, ListItemSecondaryAction, ListItemIcon, ListItemText } from 'material-ui/List';
import AssignmentIcon from 'material-ui-icons/Assignment';
import AddIcon from 'material-ui-icons/PlaylistAdd';
import InfoIcon from 'material-ui-icons/InfoOutline';
import WorkIcon from 'material-ui-icons/Work';
import FindIcon from 'material-ui-icons/Search';
import ResetIcon from 'material-ui-icons/Clear';
import DetailsIcon from 'material-ui-icons/ChromeReaderMode';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import StarBorder from 'material-ui-icons/StarBorder';
import Collapse from 'material-ui/transitions/Collapse';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/Menu/MenuItem';
import Hidden from 'material-ui/Hidden';
import Grid from 'material-ui/Grid';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table'
import Tabs, { Tab } from 'material-ui/Tabs';
import Paper from 'material-ui/Paper';
import blue from 'material-ui/colors/blue';
import red from 'material-ui/colors/red';


injectTapEventPlugin();
addLocaleData(enLocaleData);

const drawerWidth = 240;
const theme = createMuiTheme({
  palette: {
    // Purple and green play nicely together.
    danger: red
  },
});
const styles = theme => ({
  root: {
    // width: '100%',
    // height: 'auto', marginTop: theme.spacing.unit * 3,
    zIndex: 1,
    // overflow: 'overlay'
  },
  appFrame: {

    display: 'flex',
    width: '100%',
    // height: '100%'
  },
  rootGrid: {
    flexGrow: 1
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create([
      'margin', 'width'
    ], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create([
      'margin', 'width'
    ], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: 'none'
  },
  drawerPaper: {

    height: '100%',
    width: drawerWidth,
    top: '64px',
    position: 'absolute',
  },
  drawerPaper2: {

    height: '100%',
    width: drawerWidth
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px'
  },
  content: {
    width: '100%',
    [theme.breakpoints.down('lg')]: {
      marginLeft: `0px`
    },
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing.unit * 4,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64
      }
    }
  },
  
  contentShift: {
    marginLeft:"50px",
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },

});

function TabContainer({ children, dir }) {
  return (
    <div dir={dir}>
      {children}
    </div>
  );
}

class ReactClient extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      project: {
        Project_config: []
      },
      tasks: "",
      workers: "",
      dispatchers: [],
      tasks: [],
      selectedtask: null,
      priority: "",
      status: "",
      category: "",
      work_order: "",
      created_by: "",
      assigned_to: "",
      filter: [],
      result: false,
      selectedtask2: "",
      currentComponent: "list",
      pageCount: 0,
      perPage: 6,
      pagedTasks: [],
      selected: null,
      filtertask: null,
      flag: false,
      page: "tasks",
      filterMenu: false,
      open: false,
      filterOpen: false,
      tabValue: 0,
      rowsPerPage: [5,10,15],
      rows: [],
      numberOfRows: 5,
      pages: 1,
      total: undefined,
      auth:false,
    }
    this.loadTasks()
    this.loadProject()
    this.loadWorkers()
    this.loadDispatchers()
   
  }

  resetFilter=()=>{
    this.setState({priority:"",status:"",category:"",work_order:"",created_by:"",assigned_to:""})
  this.loadTasks()
  }
  openFilterMenu = () => {
    this.setState({
      page: "tasks",
      filterOpen: !this.state.filterOpen
    });
  };
  state = {
    mobileOpen: false
  };

  handleDrawerToggle = () => {
    this.setState({
      open: !this.state.open
    });
  };
  sendFilter = () => {
    this.setState({ page: "tasks" })
    var priority = "",
      status = "",
      work_order = "",
      worker = "",
      dispatcher = "",
      category = ""
    if (this.state.priority) {

      priority = "priority=" + this.state.priority + "&"
    }
    if (this.state.category) {

      category = "Category=" + this.state.category + "&"
    }
    if (this.state.status) {
      status = "status=" + this.state.status + "&"
    }
    if (this.state.work_order) {
      work_order = "work_order=" + this.state.work_order + "&"
    }
    if (this.state.created_by) {
      dispatcher = "created_by__username=" + this.state.created_by + "&"
    }
    if (this.state.assigned_to) {
      worker = "assigned_to__username=" + this.state.assigned_to + "&"
    }

    var url = '/apps/cartoview_workforce_manager/api/v1/project/' + id + '/tasks/?' + priority + status + work_order + worker + dispatcher + category

    fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: new Headers({ "Content-Type": "application/json; charset=UTF-8" })
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then((data) => {
      if (data.objects.length == 0) {
      
        this.setState({ result: true })
      } else {
        this.setState({ result: false })
      }
      this.setState({
        tasks: data.objects,
        filtertask: data.objects,
        loading: false,
        pageCount: Math.ceil(data.objects.length / this.state.perPage)
      }, () => {
        var pagedTasks = this.state.tasks.slice(0, this.state.perPage);
        this.setState({ pagedTasks: pagedTasks })

      })
    })
  }
  checkDispatcher = (dispatchers) => {
      dispatchers.map((dispatcher) => {
      if (dispatcher.dispatcher.username === username) {
        this.setState({ auth: true })
      }
    })
  }
  loadTasks = () => {
    var url = '/apps/cartoview_workforce_manager/api/v1/project/' + id + '/tasks'
    fetch(url, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": getCRSFToken() })
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then((data) => {

      this.setState({
        tasks: data.objects,
        filtertask: data.objects,
        loading: false,
        pageCount: Math.ceil(data.objects.length / this.state.perPage)
      }, () => {
        var pagedTasks = this.state.tasks.slice(0, this.state.perPage);
        this.setState({ pagedTasks: pagedTasks })
      })

    });
  }
  loadProject = () => {
    var url = '/apps/cartoview_workforce_manager/api/v1/project/' + id
    fetch(url, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": getCRSFToken() })
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then((data) => {

      this.setState({ project: data })
    });
  }
 
  loadWorkers = () => {
    var url = '/apps/cartoview_workforce_manager/api/v1/project/' + id + "/workers"
    fetch(url, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": getCRSFToken() })
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then((data) => {

      this.setState({ workers: data.objects })
    });
  }
  handlePageClick = (data) => {
    var pagedTasks = this.state.tasks.slice(data.selected * this.state.perPage, (data.selected + 1) * this.state.perPage);
    this.setState({ pagedTasks: pagedTasks })

  }
  loadDispatchers = () => {
    var url = '/apps/cartoview_workforce_manager/api/v1/project/' + id + "/dispatchers"
    fetch(url, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": getCRSFToken() })
    }).then(function (response) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    }).then((data) => {
      console.log(data.objects)
      this.setState({ dispatchers: data.objects }, this.checkDispatcher(data.objects))
    });
  }

  componentWillMount() { 
   
  }

  getChildContext() {
    // return { muiTheme: getMuiTheme(CustomTheme) };
  }

  componentDidMount() { }

  _toggleBaseMapModal() { }
  handleMainTabsChange = (event, tabValue) => {
    this.setState({ tabValue });
  };

  handleMainTabsChangeIndex = index => {
    this.setState({ tabValue: index });
  };

  search = (e) => {
    e.preventDefault()

  }
  toggle = () => {
    this.setState({
      filterMenu: !this.state.filterMenu
    })
  }
  handleFilter = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  myProjects = () => {
    window.location.href = '/apps/appinstances/?app__name='+ app_name +'&limit=100&offset=0&owner__username=' + username
  }
  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  renderResponsiveDrawer = () => {

    const { classes, theme } = this.props;

    const drawer = (

      <div className={classes.drawerInner}>

        <Divider />
        <List>
         
     

          <ListItem dense button onClick={() => {
            this.setState({ "selectedtask": null, result: false, page: "tasks" })
            this.loadTasks()
          }}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Tasks" />
          </ListItem>
         {this.state.auth&& <ListItem dense button onClick={() => this.setState({ currentComponent: "add", page: "new" })}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            
            <ListItemText primary='New Task' />
          </ListItem>}
          <ListItem dense button onClick={this.openFilterMenu}>
            <ListItemIcon>
              <FindIcon />
            </ListItemIcon>
            <ListItemText primary="Filters" /> {this.state.filterOpen
              ? <ExpandLess />
              : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.filterOpen} transitionDuration="auto" unmountOnExit>
            <ListItem className={classes.nested}>
              {< ul style={{width:"100%"}}> {
                this.state.project.priority && this.state.project.Project_config.includes("priority") && <TextField fullWidth="true" id="priority" value={this.state.priority} select SelectProps={{
                  MenuProps: {
                    className: classes.menu
                  }
                }} className={styles.textField} fullWidth="true" onChange={this.handleFilter('priority')} helperText="Filter By Priority" margin="normal">

                  {this.state.project.priority.priority.map(option => (
                    <MenuItem key={option.label} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                  
                </TextField>
              } < br /> {
                  this.state.project.status && this.state.project.Project_config.includes("status") && <TextField fullWidth="true" id="status" select SelectProps={{
                    MenuProps: {
                      className: styles.menu
                    }
                  }} className={styles.textField} value={this.state.status} fullWidth="true" onChange={this.handleFilter('status')} helperText="Filter By Status" margin="normal">

                    {this.state.project.status.status.map(option => (
                      <MenuItem key={option.label} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                } < br /> {
                  this.state.project.Category && this.state.project.Project_config.includes("Category") && <TextField  fullWidth="true"id="category" select SelectProps={{
                    MenuProps: {
                      className: styles.menu
                    }
                  }} className={styles.textField} value={this.state.category} onChange={this.handleFilter('category')} helperText="Filter By Category" margin="normal">

                    {this.state.project.Category.Category.map(option => (
                      <MenuItem key={option.label} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                } < br /> {
                  this.state.project.Project_config.includes("work_order") && <TextField  fullWidth="true" id="workorder" style={{

                  }} label="work order" className={classes.textField} defaultValue={this.state.work_order} onChange={this.handleFilter('Work_order')} margin="normal" />
                } < br /> {
                  this.state.dispatchers && <TextField fullWidth="true" id="dispatcher" select SelectProps={{
                    MenuProps: {
                      className: styles.menu
                    }
                  }} className={styles.textField} value={this.state.created_by} onChange={this.handleFilter('created_by')} helperText="Filter By Creator " margin="normal">

                    {this.state.dispatchers.map(option => (
                      <MenuItem key={option.dispatcher.username} value={option.dispatcher.username}>
                        {option.dispatcher.username}
                      </MenuItem>
                    ))}
                  </TextField>
                } < br /> {
                  this.state.project.Project_config.includes("assigned_to") && this.state.project && <TextField  fullWidth="true"id="assignee" select SelectProps={{
                    MenuProps: {
                      className: styles.menu
                    }
                  }} className={styles.textField} value={this.state.assigned_to} onChange={this.handleFilter('assigned_to')} helperText="Filter By assignee " margin="normal">
                    {this.state.workers.map(option => (
                      <MenuItem key={option.worker.username} value={option.worker.username}>
                        {option.worker.username}
                      </MenuItem>
                    ))}
                  </TextField>
                } 

<div>
      <IconButton raised color="primary" className={classes.button} onClick={this.sendFilter}>
          <FindIcon/>
      </IconButton>
      <IconButton raised color="primary" className={classes.button}  style={{"marginTop": "10px"}} onClick={this.resetFilter}>
           <ResetIcon/>
      </IconButton>
</div>
              </ul >}
            </ListItem>
          </Collapse>
          <ListItem dense button onClick={() => this.setState({ currentComponent: "details", page: "details" })}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary='Project Details' />
          </ListItem>

          <ListItem dense button onClick={this.myProjects}>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary='My Projects' />
          </ListItem>

          <ListItem dense button onClick={() => this.setState({ page: "about" })}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary='About' />
          </ListItem>
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar className={classNames(classes.appBar)}>
            <Toolbar disableGutters={!this.state.open}>
              <IconButton color="contrast" aria-label="open drawer" onClick={() => {
                this.handleDrawerToggle()
              }} className={classNames(classes.menuButton)}>
                <MenuIcon />
              </IconButton>
               <Avatar src={this.state.project.logo
              ? this.state.project.logo.base64
              : URLS.static + 'nologo.png'} />
              <Typography type="title"  className={this.props.classes.title} color="inherit" noWrap>
                {this.state.project.title}
              </Typography>
            </Toolbar>
          </AppBar>
          <Hidden mdDown>
            <Drawer type="persistent" classes={{
              paper: classes.drawerPaper
            }} open={this.state.open}>
              {drawer}
            </Drawer>

          </Hidden>

          <Hidden lgUp>
            <Drawer className='myClass' type="temperory"
              onRequestClose={this.handleDrawerClose}
              classes={{
                paper: classes.drawerPaper2
              }} open={this.state.open}>
              {drawer}
            </Drawer>
          </Hidden>
          <Grid container spacing={0} alignItems="center" justify="center">
            <Grid item xs={11} sm={11} md={8} lg={8}>
              <main className={classNames(classes.content, this.state.open && classes.contentShift)}>

                {this.state.page == "tasks" && this.renderMainTabs()}
                {this.state.project && this.state.dispatchers && this.state.page == "new" && <AddTask project={this.state.project} mapid={this.state.project.mapid} dispatchers={this.state.dispatchers} classes={this.props.classes} />
                }
                {this.state.workers && this.state.project && this.state.page == "details" && <ProjectDetails id={id} project={this.state.project} mapid={this.state.project.mapid} workers={this.state.workers} classes={this.props.classes} open={this.state.open}/>
                }
                {this.state.page == "about" &&
                  <Grid container direction={"row"} spacing={16} alignItems="center" justify="center">
                    <Grid item xs={12} sm={8}>
                      <Paper>
                        <p className="formated" >
                          Cartoview app to manage project/work group tasks. It provides a full management of a task status, priority, location ,attachments and comments
                        </p>
                      </Paper>
                    </Grid>
                  </Grid>}
              </main>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }

  renderMainTabs = () => {
    return (
      <Grid container alignItems="center" justify="center">
        <Grid item xs={12} sm={12} md={12} lg={12}>
        <Paper>
          {this.state.pagedTasks.length != 0 && !this.state.selectedtask && <AppBar position="static" color="default">
            <Tabs value={this.state.tabValue} onChange={this.handleMainTabsChange} indicatorColor="primary" textColor="primary" centered >
              <Tab label="Tasks"  className={"buttonCenter"} onClick={() => {
                this.setState({ "selectedtask": null, result: false })
                this.loadTasks()
              }} />
              <Tab label="My Tasks" onClick={() => {
                this.setState({ "selectedtask": null, result: false })
                this.loadTasks()
              }} />

            </Tabs>
          </AppBar>}
          {this.state.loading && <Grid container alignItems="center" justify="center">
                <Grid >
                  <img src={URLS.static + 'cartoview_workforce_manager/loader'} />
                </Grid>
              </Grid>
              }
          {this.state.tabValue === 0 && <TabContainer>
            {this.state.pagedTasks.length != 0 && !this.state.selectedtask && !this.state.loading && <div >
              

              <Table >
                <TableHead>
                  <TableRow >
                    <TableCell style={{"padding": "0" ,"textAlign": "center"}}>
                      Title</TableCell>
                    {this.state.project.Project_config.includes("assigned_to") && <TableCell style={{"padding": "0" ,"textAlign": "center"}} > Assigned to </TableCell>}
                    {this.state.project.Project_config.includes("priority") && <TableCell style={{"padding": "0" ,"textAlign": "center"}}>Priority</TableCell>}
                    {this.state.project.Project_config.includes("status") && <TableCell style={{"padding": "0" ,"textAlign": "center"}} > Status </TableCell>}

                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.pagedTasks.map(item => {
                    return (
                      <TableRow className={"hoverPointer"} key={item.id} hover onClick={() => {
                        this.setState({ "selectedtask": item })
                      }}>
                        <TableCell style={{"padding": "0" ,"textAlign": "center"}}>{item.title}</TableCell>
                        {this.state.project.Project_config.includes("assigned_to") && < TableCell style={{"padding": "0" ,"textAlign": "center"}}> {
                          item.assigned_to.username
                            ? item.assigned_to.username
                            : "-"
                        } </TableCell>}
                        {this.state.project.Project_config.includes("priority") && <TableCell style={{"padding": "0" ,"textAlign": "center"}}>{item.priority
                          ? item.priority
                          : '-'}</TableCell>}
                        {this.state.project.Project_config.includes("status") && <TableCell  style={{"padding": "0" ,"textAlign": "center"}}> {
                          item.status
                            ? item.status
                            : '-'
                        }
                        </TableCell>}

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

            
              {this.state.project && this.state.dispatchers && this.state.page == "new" && <AddTask project={this.state.project} mapid={this.state.project.mapid} dispatchers={this.state.dispatchers} />
              }

              {this.state.pageCount > 1 && 
              <ReactPaginate previousLabel={<ChevronLeftIcon/>} nextLabel={<ChevronRightIcon/>} breakLabel={<a href="" > ...</a>} breakClassName={"break-me"} pageCount={this.state.pageCount} marginPagesDisplayed={2} pageRangeDisplayed={5} onPageChange={this.handlePageClick} containerClassName={"pagination"} subContainerClassName={"pages pagination"} activeClassName={"active"} />}
            </div>}

         
          </TabContainer>}
          {this.state.selectedtask && <div>
                <TaskDetails task={this.state.selectedtask} mapid={this.state.project.mapid} project={this.state.project} dispatchers={this.state.dispatchers}/>
              </div>
              }
          {this.state.tabValue === 1 && <TabContainer><MyTasks id={id} project={this.state.project} selected={this.state.selected} pageCount={this.state.pageCount} classes={this.props.classes} /></TabContainer>}
  {!this.state.tasks.length && !this.state.loading && !this.state.result && <div>
                <p className="formated">No tasks yet for this project</p>
              </div>
              }
              {this.state.pagedTasks.length == 0 && this.state.result && 
             <div className="center"><p className="formated">No result found !</p></div>}
              
</Paper>
        </Grid>
      </Grid>
    )
  }

  renderTasksTable = () => {
    const { classes, theme } = this.props;
    return (
      <Grid container>
        <Grid item xs={12} sm={12}  md={12} lg={12} >
          <Paper className={classes.paper}>

          </Paper>
        </Grid>
      </Grid>
    )
  }


  render() {

    let { currentComponent } = this.state
    return (

      <div >

        {this.renderResponsiveDrawer()}


      </div>
     
    )
  }
}

ReactClient.childContextTypes = {
  muiTheme: React.PropTypes.object
};
ReactClient.propTypes = {
  classes: PropTypes.object.isRequired
};
let App = withStyles(styles)(ReactClient)
export default withStyles(styles)(ReactClient)
render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>, document.getElementById('root'))
