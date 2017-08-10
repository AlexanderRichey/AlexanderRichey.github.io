---
layout: post
title: Setting Up Server Side Rendering with React, React-Router 3, Redux, and Django
---

At a high level, setting up server side rendering consists in setting up the following chain of events.

1. Server receives request.
2. Database is queried and needed information is received in memory.
3. Needed information plus a desired path are passed into a render function.
4. The render function returns markup that is then sent down to the client.

Since neither Python nor Django can understand JavaScript, we need a Node runtime to render our React app. Therefore, we need a dedicated render server. When a request hits our server, we'll query our database to get the info we need. Then we'll send that info in an http `POST` request to our render server, which will return our markup, plus the final state of our Redux store.

Let's start out by getting that much setup. In order to write this code in a testable way, we'll start with a first pass at the render server.

```js
// server.js

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const ADDRESS = process.env.NODE_HOST
const PORT = process.env.NODE_PORT

const app = express()
const server = http.Server(app)

// I've increased the limit of the max payload size in case a huge page
// needs to be rendered
app.use(bodyParser.json({ limit: '10mb' }))

// Morgan is the very silly name of some logging middleware
app.use(morgan('combined'))

app.get('/', function (req, res) {
  res.end('Render server here!')
})

app.post('/render', function (req, res) {
  // We know we'll need a path and the data for our initial state,
  // so let's save this stuff first
  const url = req.body.url
  const initialState = req.body.initialState

  // Eventually we'll return markup and our final state. For now,
  // for the sake of testing, let's just return our inputs
  res.json({
    html: url,
    finalState: initialState
  })
})

server.listen(PORT, ADDRESS, function () {
  console.log('Render server listening at http://' + ADDRESS + ':' + PORT)
})
```

Let's test this in the shell with cURL before wiring up the Django app.

```bash
# Fire up the server
$ node server.js
Render server listening at http://localhost:9009

# In another window, let's test it
$ curl http://localhost:9009
Render server here!

$ curl -X POST -d '{"url": "/", "initialState", {}}' http://localhost:9009
{
  html: "/",
  finalState: {}
}
```

Looks good so far. Now let's wire up the Django app and test it's interaction with the render server.

```python
# views.py

def sandwich(request, id):
    try:
        sandwich = Sandwich.objects.get(id=id)
        sandwich_data = sandwich.to_user()
        # Sandwich#to_user is a method that returns a nice sandwich object
    except Sandwich.DoesNotExist:
        sandwich_data = {}
    # The magic happens in our _react_render helper function
    return _react_render({'sandwich': sandwich_data}, request)


def _react_render(content, request):
    # Let's grab our user's info if she has any
    if request.user.is_authenticated():
        # User#to_client is another little helper method that returns
        # an object just the way we want it
        user = request.user.to_client()
    else:
        user = {}

    # Here's what we've got so far
    render_assets = {
        'url': request.path_info,
        'user': user
    }
    # Now we add the sandwich. We use the Dict#update method so that the
    # key could be anything, like pizza or cake or burger.
    render_assets.update(content)

    try:
        # All right, let's send it! Here we use requests, a very nice wrapper
        # around urllib. Note that we set the content type to json.
        res = requests.post(settings.RENDER_SERVER_BASE_URL + '/render',
                            json=render_assets,
                            headers={'content_type': 'application/json'})
        rendered_payload = res.json()
    except Exception as e:
        # If we get here, then something broke! Let's report that error
        # and return some default data.
        ErrorReporter.report(ErrorReporter.RENDER_SERVER_FAILURE, {'error': e})
        return render(request, 'base.html', {
            'html': '',
            'finalState': json.dumps({}),
        })
    # Beautiful! Let's render this stuff into our base template
    return render(request, 'base.html', rendered_payload)
```

Here's how we insert our rendered react app into our more standard Django template. If you want to support meta tags, etc., all you need to do is add that data to the `rendered_payload` object and then reference it in the template.

```html
<!-- base.html -->
{ load render_bundle from webpack_loader }
{ load webpack_static from webpack_loader }

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The Finest Deli</title>

    { render_bundle 'bodega' 'css' }
    { render_bundle 'bodega' 'js' attrs='async' }
  </head>
  <body>

    <!-- Root -->
    <main id="root">{ html|safe }</main>

    <!-- Redux State -->
    <script>
      window.__REDUX_STATE__ = { finalState|safe }
    </script>

  </body>
</html>
```

We're ready to test again. Let's fire up our Django server, open up a browser, and go to the url that corresponds to our sandwich view. To prevent our React frontend from taking over the page on load, let's disable JavaScript in DevTools. If you see a page with a slash on it, you're in business!

Now let's go back to our `server.js` and think about how we want to handle rendering. We'll want to call a render method, which we haven't written yet, and we'll also need to massage our initialState data so that it matches the shape of our Redux store.

```js
// server.js

app.post('/render', function (req, res) {
  const url = req.body.url
  const initialState = buildInitialState(req.body) // Massages data into the
                                                   // shape of our Redux store

  // Haven't written this yet, but this is what it'll output
  const result = render(url, initialState)

  res.json({
    html: result.html,
    finalState: result.finalState
  })
})
```

Now we're getting to the interesting part: the actual render function. This function will have to import our entire React frontend, which means that we'll have to run it through webpack to handle all of our dependences and to transpile our source into ES5 since not all ES6 features are supported yet. We also have to change our webpack target runtime to `node`, since we won't be running in the browser.

The fact that our React app won't be running in the browser also means that `window` and `document` will not be defined. Therefore, ***all references to the `window` and `document` must not occur in code that gets executed prior to mounting to the DOM***. Such references need to be moved to component lifecycle methods like `Component#componentDidMount` that are fired after mounting. This may involve a bit of work and you may also need to alter some of your dependences if they refer to `window` in problematic places.

Assuming your React app is in good shape, let's now write another webpack config to bundle our app for the server before writing our render function.

```js
// webpack.server.config.js

const path = require('path')
const webpack = require('webpack')

module.exports = {
  name: 'server-side rendering',
  entry: path.resolve(__dirname, 'render_server', 'render.jsx'),
  target: 'node', // Here's the only interesting part
  output: {
    path: path.join(__dirname, 'render_server', 'dist'),
    filename: 'bodega.server.js',
    publicPath: '/static/',
    libraryTarget: 'commonjs2'
  },
  externals: /^[a-z\-0-9]+$/,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        }
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$|\.jpe?g$|\.gif$|\.png$|\.svg$/,
        loader: 'file-loader?name=[name].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        // Added `server` env variable in case you need to make adjustments to
        // your code based on where it's going to be run
        'MACHINE': JSON.stringify('server')
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
```

Now let's actually write our render function. There's a number of things we need to consider.

- Which resource to use to render our app to markup
- How to import our existing React app
- How to match the desired route with React Router 3
- How to handle the React-Redux `<Provider>` component

Let's take these questions in order. To render our app to markup, we can use the `ReactDOMServer#renderToString` method. This takes a React component and renders it to a giant string of html markup. Easy.

In importing our existing React app, we can't use our standard entry point, since that references the `document`, waits for `DOMContentLoaded`, etc. We also can't use the version of React-Router that we use in browser, since that requires `browserHistory`, which isn't available in Node runtime.

To resolve these difficulties, I abstracted my app's routes into a new function called `getRoutes`. It takes the Redux store as an argument and returns all of the routes to my app, with all of their embedded components. I then use this function to insert my routes into a `<Router>` component in my browser entry point and to insert my routes into React-Router's `match` function in my server entry point.

The `match` function is how we match the desired route on the server side. It's first argument is an object containing all of our app's routes as its first key, and our desired location as the second key. The `match` function's second argument is a callback that gets evoked after matching is complete. In a successful matching, the callback's third argument will be a `renderProps` object. The `renderProps` represent the state of our app's props at a given location. We can then use React-Router's `<RouterContext>` component, which is sort of like a static version of its more familiar `<Router>` component, to render the state of our app with the given `renderProps`.

Finally, we can wrap our `<RouterContext>` with React-Redux's `<Provider>` so that all of the components in the tree can access the Redux store.

```js
// render.jsx

import React from 'react'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import { Helmet } from 'react-helmet'
import ReactDOMServer from 'react-dom/server'
import configureStore from '../bodega/src/scripts/store/store'
import getRoutes from '../bodega/src/scripts/components/routes'

export default function render (url, initialState) {
  const store = configureStore(initialState)

  const routes = getRoutes(store)

  let html, redirect
  match({ routes, location: url }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      redirect = redirectLocation.pathname
    } else if (renderProps) {
      // Here's where the actual rendering happens
      html = ReactDOMServer.renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      )
      Helmet.renderStatic() // This is called to prevent a memory leak.
                            // See https://github.com/nfl/react-helmet#server-usage
                            // for more info.
    }
  })

  if (redirect) return render(redirect, initialState) // Recursion, baby

  const finalState = store.getState()

  return {
    html,
    finalState
  }
}
```

Beautiful! Let's tell webpack to build our server bundle, import it into `server.js` to define the render function, and test our work by opening up the Sandwich page in a browser with JavaScript disabled. If everything is setup properly, we should see our fully rendered React app in the initial server response.

There is now just one more detail to work out, that is, how to configure our browser entry point to start Redux with the pre-rendered store. This is pretty easy, since all we have to do is pass `window.__REDUX_STATE__` into our `configureStore` method.

Finally, you also might have noticed that I added an `async` attribute to my script tag in `base.html`. The `async` attribute makes the tag non-render-blocking, which means that the browser won't wait for the entire script to download before rendering. This produces a considerable speed increase, especially with large JavaScript bundles. However, it also means that it is possible for the script to be loaded at any time during the load process, which means that the standard procedure of waiting for `DOMContentLoaded` before rendering with `ReactDOM` might not always work, since `DOMContentLoaded` might have already fired, in which case, the React app would never get executed and the page would never become interactive. Therefore, I check the `document.readyState` when the bundle is initially loaded. If the `readyState` is `complete` or `interactive`, I initialize my React app right away. Otherwise, I add listener for `DOMContentLoaded` and use my initialize function as the callback.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { match } from 'react-router'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import configureStore from './bodega/store/store'
import Root from './bodega/components/root'
import getRoutes from './bodega/components/routes'

import './styles/main.scss'

switch (document.readyState) {
  case 'interactive':
  case 'complete':
    initializeApp()
    break
  case 'loading':
  default:
    document.addEventListener('DOMContentLoaded', initializeApp)
}

function initializeApp () {
  const store = configureStore(window.__REDUX_STATE__)

  const { pathname, search, hash } = window.location
  const location = `${pathname}${search}${hash}`
  const routes = getRoutes(store)

  match({ routes, location }, () => {
    ReactDOM.render(
      <Provider store={store}>
        <Router history={browserHistory}>
          {getRoutes(store)}
        </Router>
      </Provider>
      document.getElementById('root')
    )
  })
}
```

Now let's enable JavaScript in our browser again, hit reload, and marvel at the speed of server side rendering.
