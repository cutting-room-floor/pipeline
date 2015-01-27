var React = require('react/addons'),
  Reflux = require('reflux'),
  Router = require('react-router'),
  { NotFoundRoute, Navigation, State, Link, Route,
    RouteHandler, DefaultRoute } = Router;

var turfDocs = require('./turf.json').functions;

var samples = [
  {
    name: 'null island',
    data: {
      type: 'Point',
      coordinates: [0, 0]
    }
  }
];

window.React = React;

var setInput = Reflux.createAction();
var pipelineStore = Reflux.createStore({
  pipeline: {
    input: null,
    steps: [],
    output: null
  },
  getInitialState() {
    return this.pipeline;
  },
  init() {
    this.listenTo(setInput, this.setInput);
  },
  setInput(name) {
    this.pipeline.input = {
      name: name
    };
    this.trigger(this.pipeline);
  }
});

var InputOption = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  selectInput() {
    if (this.props.name !== 'Sample') return alert('Only Sample is supported right now');
    setInput(this.props.name);
  },
  render() {
    var klass = (this.state.pipeline.input &&
      this.state.pipeline.input.name === this.props.name) ?
      'fill-lighten3 pad2 keyline-all' : 'fill-white pad2 keyline-all';
    return (<a onClick={this.selectInput} className='col2 pad0'>
      <div className='fill-green'>
        <div className={klass}>
          <h3>{this.props.name}</h3>
        </div>
      </div>
    </a>);
  }
});

var InputSection = React.createClass({
  render() {
    return (<div>
      <h2 className='pad0x'>Input</h2>
      <div className='pad1y col12 clearfix'>
        <InputOption name='Sample' />
        <InputOption name='GeoJSON' />
      </div>
    </div>);
  }
});

var InputSettings = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  render() {
    if (this.state.pipeline.input && this.state.pipeline.input.name) {
      return (<div className='pad0'>
        <div className='pad1 fill-grey'>
          <h3 className='pad0x'>Settings</h3>
          <div className='pad1y col12 clearfix'>
            <SampleSettings />
          </div>
        </div>
      </div>);
    } else {
      return (<div></div>);
    }
  }
});

var TurfOptions = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  render() {
    return (<div>
      {turfDocs.map(doc => <TurfOption {...doc} />)}
    </div>);
  }
});

var TurfOption = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  selectInput() {
    setInput(this.props.name);
  },
  render() {
    var klass = (this.state.pipeline.input &&
      this.state.pipeline.input.name === this.props.name) ?
      'fill-lighten3 pad1 keyline-all' : 'fill-white pad1 keyline-all';
    return (<a onClick={this.selectInput} className='col2 pad0'>
      <div className='fill-green'>
        <div className={klass}>
          <div className='row2 clip'>
            <h3>{this.props.name.replace('turf/', '')}</h3>
            <p>{this.props.description}</p>
          </div>
        </div>
      </div>
    </a>);
  }
});

var Steps = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  render() {
    return (<div className='pad0'>
      <h2 className='pad0x'>Steps</h2>
      <div className='pad1y col12 clearfix'>
        <TurfOptions />
      </div>
    </div>);
  }
});

var SampleSettings = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  render() {
    return (<div>
      <select onChange={this.chooseSample}>
        {samples.map(sample => (<option
          value={sample.name}>{sample.name}</option>))}
      </select>
    </div>);
  }
});

// # Components
var Page = React.createClass({
  render() {
    /* jshint ignore:start */
    return (
      <div className='clearfix pipeline'>
        <div className='pad1y col12 fill-grey'>
          <h2>
            <img width='50' height='50' src='logo.png' />
            <div className='pad1y inline'>
              Pipeline
            </div>
          </h2>
        </div>
        <div className='pad4x pad2y'>
          <InputSection />
          <InputSettings />
          <Steps />
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

// Our router. This manages what URLs mean and where Links can go.
var routes = (
  /* jshint ignore:start */
  <Route handler={Page} path='/'>
  </Route>
  /* jshint ignore:end */
);

var router = Router.create({ routes });

router.run(Handler => {
  /* jshint ignore:start */
  React.render(<Handler/>, document.body);
  /* jshint ignore:end */
});
