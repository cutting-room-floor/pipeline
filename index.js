var React = require('react/addons'),
  Reflux = require('reflux'),
  Router = require('react-router'),
  { NotFoundRoute, Navigation, State, Link, Route,
    RouteHandler, DefaultRoute } = Router;

// Provide your access token
L.mapbox.accessToken = 'pk.eyJ1IjoidG1jdyIsImEiOiJIZmRUQjRBIn0.lRARalfaGHnPdRcc-7QZYQ';

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
var setStepType = Reflux.createAction();
var pipelineStore = Reflux.createStore({
  pipeline: {
    input: null,
    steps: [{
      name: 'identity',
      parameters: {}
    }],
    output: null
  },
  getInitialState() {
    return this.pipeline;
  },
  init() {
    this.listenTo(setInput, this.setInput);
    this.listenTo(setStepType, this.setStepType);
  },
  setStepType(i, name) {
    this.pipeline.steps[0] = {
      name: name,
      parameters: {}
    };
    this.trigger(this.pipeline);
  },
  setInput(input) {
    this.pipeline.input = input;
    this.trigger(this.pipeline);
  }
});

var InputOption = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  selectInput() {
    if (this.props.name !== 'Sample') return alert('Only Sample is supported right now');
    setInput({ name: this.props.name });
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
    return (<div className='space-top4'>
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
    var step = this.state.pipeline.steps[this.props.step];
    if (step.name === 'identity') {
      return (<div>
        {turfDocs.map(doc =>
          <TurfOption
          key={doc.name}
          step={this.props.step} {...doc} />)}
      </div>);
    } else {
      return (<div>
        {turfDocs.filter(doc => doc.name === step.name)
          .map(doc =>
          <TurfOption
          key={doc.name}
          big={true} step={this.props.step} {...doc} />)}
      </div>);
    }
  }
});

var TurfOption = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  setStepType() {
    var step = this.state.pipeline.steps[this.props.step];
    if (step.name === this.props.name) {
      setStepType(this.props.step, 'identity');
    } else {
      setStepType(this.props.step, this.props.name);
    }
  },
  render() {
    var step = this.state.pipeline.steps[this.props.step];
    var klass = (step.name === this.props.name) ?
      'fill-lighten3 pad1 keyline-all' : 'fill-white pad1 keyline-all';
    var size = this.props.big ? 'col12' : 'col2 pad0 small';
    var height = this.props.big ? '' : 'row3 clip';
    return (<a onClick={this.setStepType} className={size}>
      <div className='fill-blue'>
        <div className={klass}>
          <div className={height}>
            <h3>{this.props.name.replace('turf/', '')}</h3>
            <p>{this.props.description}</p>
          </div>
        </div>
      </div>
    </a>);
  }
});

var Output = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  componentDidMount() {
    var map = L.mapbox.map(this.refs.map.getDOMNode(), 'tmcw.l12c66f2', {
      scrollWheelZoom: false
    });
    this.layer = L.mapbox.featureLayer().addTo(map);
  },
  componentDidUpdate() {
    if (this.state.pipeline.input.data) {
      this.layer.setGeoJSON(this.state.pipeline.input.data);
    }
  },
  render() {
    return (<div className='pad0 pad4y space-top4 keyline-top'>
      <div ref='map' className='row5 pad1y col12 clearfix'>
      </div>
    </div>);
  }
});

var Steps = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  render() {
    if (!this.state.pipeline.input) {
      return (<div></div>);
    }
    return (<div className='pad0 pad4y space-top4 keyline-top'>
      <h2 className='pad0x'>Steps</h2>
      <div className='pad1y col12 clearfix'>
        {this.state.pipeline.steps.map((step, i) =>
          <TurfOptions step={i} />
        )}
      </div>
    </div>);
  }
});

var SampleSettings = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  chooseSample(e) {
    setInput({
      name: 'sample',
      data: samples.filter(sample => sample.name === e.target.value)[0].data
    });
  },
  render() {
    return (<div>
      <select onChange={this.chooseSample}>
        <option key='' value=''></option>
        {samples.map(sample => (<option
          key={sample.name}
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
          <Output />
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
