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

## Layout

A lot of graphs, including flow, allow free placement of nodes. I don't think
this is necessary, and it may introduce problems as well as eliminate some
useful signals to the user about function arity.
