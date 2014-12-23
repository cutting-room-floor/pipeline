var Router = require('react-router'),
  React = require('react'),
  Reflux = require('reflux'),
  turf = require('turf'),
  turfDefinitions = require('turf-definitions'),
  { Route, DefaultRoute } = Router;

turf.buffered = function(_) { return turf.buffer(_, 100, 'miles'); };

L.mapbox.accessToken = 'pk.eyJ1IjoidG1jdyIsImEiOiJIZmRUQjRBIn0.lRARalfaGHnPdRcc-7QZYQ';

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
var removePipe = Reflux.createAction();
var pipelineStore = Reflux.createStore({
  pipeline: [],
  getInitialState() { return this.pipeline; },
  init() {
    this.listenTo(addPipe, this.addPipe);
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

    var geometry = inputGeometry;

    var stages = this.state.pipeline.map((pipe, i) => {
      geometry = maybeBbox(turf[pipe.name](clone(geometry)));
      return <Map i={i} key={i} name={pipe.name} data={clone(geometry)} />;
    });

    return <div className='col8 margin2 pad1 clearfix'>
      <Map name='Input' data={inputGeometry} />
      {stages}
      <AddPipe />
    </div>;
  }
});

var AddPipe = React.createClass({
  addPipe(value, e) {
    addPipe({
      name: value.name
    });
    e.preventDefault();
  },
  render() {
    return <div className='col12 pad1y'>
      <div className='pad1 fill-darken1 center'>
        <fieldset className='pill'>
        {turfDefinitions.map(td =>
          <a href='#'
            onClick={this.addPipe.bind(this, td)}
            key={td.name}
            className='icon plus button flex'>
            {td.name}</a>)}
        </fieldset>
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
    return <div className='col12'>
      <div className='pad1y'>
        <div className='contain'>
          <div className='row5 col12' ref='map'></div>
          <div className='pin-topleft fill-dark dark pad1x'>
            <h2>{this.props.name}</h2>
            {(this.props.i !== undefined) && <a href='#'
              className='icon trash'
              onClick={this.removePipe}>remove</a>}
          </div>
        </div>
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
