pipeline
========

Sketches for a JSON encoding of GIS pipelines that can be run on a variety of hosts.

## Language

I want to copy successful big languages that do similar tasks:

* Makefiles
* Grunt
* Leiningen
* Vega

There are some interesting features which could be great for GIS:

* Reusing partial results for re-running jobs, like Makefiles do
* Visualizing multiples stages of results
* Automatically handling sync / async / map-reduce tasks in the same pipe
* Automatically showing status of jobs

## UX

The user experience of fbp or visual programming presents a bunch of challenges
that I can't find good research or examples of. [This blog post](http://bergie.iki.fi/blog/flowhub-beta/)
shows a bunch of things that are a little iffy.

For instance:

How does one represent the 'starting state' of the computation? For multiple starting
states? Are these 'special' or nodes like the rest?

The big programmery things that are tricky:

* Loops
* Recursion, possibly
* Conditionals

Data: do all function arguments come from 'nodes' or are they contained in nodes as settings?

## API

It occurs to me that a chainable "monad" style interface like

```js
turf(geojson).buffer().envelope().centroid().buffer().value();
```

Would have the ability to be

* Natively typed, possibly even autocompletable, since each link in the chain will only expose functions that work with its current value type
* Lazy, since internally calls can be saved rather than immediately evaluated.

But this doesn't solve the problem of operating on more than one geometry.
