var Router = require('react-router'),
  React = require('react'),
  xt = require('xtend'),
  Reflux = require('reflux'),
  { Route, DefaultRoute } = Router;

const blockWidth = 200;
const innerBlockWidth = blockWidth - 2;
const blockHeight = 100;
const innerBlockHeight = 100 - 2;

var boxSizing = 'border-box';

var containerStyle = {
  font: 'normal 12px/20px sans-serif'
};

var linkStyle = {
  color: '#eee',
  textDecoration: 'none'
};

var blockStyle = {
  background: '#333',
  boxSizing,
  border: '1px solid #555'
};

var inputStyle = {
  font: 'normal 38px/30px sans-serif',
  textAlign: 'center',
  background: '#444',
  color: '#fff',
  padding: 10,
  width: innerBlockWidth,
  height: innerBlockHeight,
  boxSizing,
  border: 'none'
};

var connectorAStyle = {
  background: '#fff',
  position: 'absolute',
  textAlign: 'center',
  display: 'block',
  lineHeight: (20 / 2) + 'px',
  left: (blockWidth / 2) - (20/2), width: 20, height: 20, top: blockHeight / 2
};

var connectorStyle = {
  background: '#fff',
  position: 'absolute',
  top: 0, left: blockWidth / 2, width: 1, height: blockHeight / 2
};

var pageStyle = {
  background: '#222',
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0
};

var pipelineStyle = (i) => ({
  position: 'fixed',
  left: blockWidth * i,
  width: blockWidth,
  top: 0,
  boxSizing,
  borderRight: '1px solid #555',
  bottom: 0
});

var blockSize = {
  width: blockWidth,
  height: blockHeight
};

var position = (x, y) => ({
  position: 'absolute',
  transform: 'translate(' + (x * blockWidth) + 'px,' + (y * blockHeight) + 'px)'
});

var offset = (x, y) => ({
  position: 'absolute',
  transform: 'translate(' + (x) + 'px,' + (y) + 'px)'
});

var addPipe = Reflux.createAction();
var setPipe = Reflux.createAction();
var removePipe = Reflux.createAction();
var pipelineStore = Reflux.createStore({
  pipeline: [{
    type: 'input',
    pipe: 0
  }],
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

var App = React.createClass({
  mixins: [Reflux.connect(pipelineStore, 'nodes')],
  render() {
    return <div>
      <div style={pageStyle}></div>
      {[0,1,2,3,4,5].map(n => <div key={n} style={xt(pipelineStyle(n),offset(20,0))}></div>)}
      <div style={xt(offset(20, 20), containerStyle)}>
        {this.state.nodes.map(node => <Node node={node} key={node} />)}
      </div>
    </div>;
  }
});

var Connector = React.createClass({
  render() {
    return <div>
      <div style={xt(position(this.props.node.pipe, 1), connectorStyle)}></div>
      <a style={xt(position(this.props.node.pipe, 1), connectorAStyle)} href='#'>+</a>
    </div>;
  }
});

var Node = React.createClass({
  render() {
    if (this.props.node.type === 'input') return <Input {...this.props} />;
  }
});

var Input = React.createClass({
  setValue(e) {
    setPipe(this.props.pipe, {
      value: e.target.value
    });
  },
  render() {
    return <div>
        <div style={xt(position(this.props.node.pipe, 0), blockStyle, blockSize)}>
          <input type='number' style={inputStyle} onChange={this.setValue} />
        </div>
        <Connector {...this.props} />
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
    return <div style={xt(position(this.props.i, 0), blockStyle, blockSize)}>
        <a
          style={linkStyle}
          href='#'
            onClick={addPipe.bind(this, { name: 'input' })}>
            +</a>
        </div>;
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
    return <div>
      <div>
        {ops.map(td =>
          <a href='#'
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
