var Router = require('react-router'),
  React = require('react'),
  xtend = require('xtend'),
  Reflux = require('reflux'),
  turf = require('turf'),
  turfDefinitions = require('turf-definitions'),
  { Route, DefaultRoute } = Router;

turf.buffered = function(_) { return turf.buffer(_, 100, 'miles'); };
turf.input = function(_) { return _; };

L.mapbox.accessToken = 'pk.eyJ1IjoidG1jdyIsImEiOiJIZmRUQjRBIn0.lRARalfaGHnPdRcc-7QZYQ';

var occupy = function(w = 1, h = 1) {
  return {
    width: w * 400,
    height: h * 250
  };
};

var position = (x, y) => {
  return {
    position: 'absolute',
    transform: 'translate(' + (x * 400) + 'px,' + (y * 250) + 'px)'
  };
};

var offset = (x, y) => {
  return {
    position: 'absolute',
    transform: 'translate(' + (x) + 'px,' + (y) + 'px)'
  };
};

var inputGeometry = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-77, 40]
      }
  },
  {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-79, 40]
      }
    },
  {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-79, 42]
      }
    }

  ]
};

var addPipe = Reflux.createAction();
var setPipe = Reflux.createAction();
var removePipe = Reflux.createAction();
var pipelineStore = Reflux.createStore({
  pipeline: [{ name: 'input', data: inputGeometry }],
  getInitialState() { return this.pipeline; },
  init() {
    this.listenTo(addPipe, this.addPipe);
    this.listenTo(setPipe, this.setPipe);
    this.listenTo(removePipe, this.removePipe);
  },
  addPipe(pipe) {
    this.pipeline.push(pipe);
    this.trigger(this.pipeline);
  },
  removePipe(i) {
    this.pipeline.splice(i, 1);
    this.trigger(this.pipeline);
  },
  setPipe(i, pipe) {
    this.pipeline[i] = pipe;
    this.trigger(this.pipeline);
  }
});

var clone = (x) => JSON.parse(JSON.stringify(x));

var maybeBbox = (x) => Array.isArray(x) ? turf.bboxPolygon(x) : x;

var App = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'pipeline')],
  render() {

    var geometry = this.state.pipeline[0].data;

    var stages = this.state.pipeline.map((pipe, i) => {
      geometry = maybeBbox(turf[pipe.name](clone(geometry)));
      return <Stage pipe={pipe} i={i} key={i} data={clone(geometry)} />;
    });

    return <div style={offset(20, 20)}>
      {stages}
      <AddStage i={stages.length*2} />
    </div>;
  }
});

var AddStage = React.createClass({
  setPipe(i, value, e) {
    if (i === 0) return;
    setPipe(i, {
      name: value.name
    });
    e.preventDefault();
  },
  render() {
    return <a style={position(this.props.i, 0)} className='cube-short fill-lighten1 pad2 center'
          href='#'
            onClick={addPipe.bind(this, { name: 'input' })}>
            +</a>;
  }
});

var AddPipe = React.createClass({
  setPipe(i, value, e) {
    if (i === 0) return;
    setPipe(i, {
      name: value.name
    });
    e.preventDefault();
  },
  render() {
    return <div className='cube-short fill-lighten0 pad1'>
      <div className='col6'>
        {turfDefinitions.map(td =>
          <a href='#'
            className={'col12 pad0 ' + (this.props.name == td.name ? 'fill-lighten1 icon arrowright' : '')}
            onClick={this.setPipe.bind(this, this.props.i, td)}
            key={td.name}>
            {td.name}</a>)}
      </div>
    </div>;
  }
});

var Stage = React.createClass({
  render() {
    return <div>
      <div style={position((this.props.i * 2), 0)}>
        <AddPipe i={this.props.i} name={this.props.pipe.name} />
      </div>
      <div style={position((this.props.i * 2) + 1, 0)}>
        <Map data={this.props.data} name={this.props.pipe.name} />
      </div>
    </div>;
  }
});

var Map = React.createClass({
  componentDidMount() {
    this.map = L.mapbox.map(this.refs.map.getDOMNode(), 'examples.map-i86nkdio', {
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false
    });
    this.map.featureLayer.setGeoJSON(this.props.data);
    this.map.fitBounds(this.map.featureLayer.getBounds());
  },
  componentDidUpdate() {
    this.map.featureLayer.setGeoJSON(this.props.data);
  },
  removePipe() {
    removePipe(this.props.i);
  },
  render() {
    return <div className='contain'>
      <div className='cube' ref='map'></div>
      <div className='pin-topright fill-darken2 dark pad1'>
        <strong>{this.props.name}</strong>
        {(this.props.i !== undefined) && <a href='#'
          className='icon trash'
          onClick={this.removePipe}>remove</a>}
      </div>
    </div>;
  }
});

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={App} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
