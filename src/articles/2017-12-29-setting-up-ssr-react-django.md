---
layout: post
title: Setting Up Server Side Rendering with React, Redux, and Django
---
<div class="message">
My article on server side rendering originally published on Meural's <a href="https://medium.com/meural-product-development/setting-up-server-side-rendering-with-react-redux-and-django-4d6f4d2fd705">Product Blog</a>.
</div>
At Meural, we decided to implement server side rendering in order to increase our SEO exposure and to make social media sharing more effective. In this post, I’ll talk about how server side rendering works and the implementation that I developed.

## Background

In traditional web applications, web pages are rendered on the client side. The browser receives a blob of JavaScript from the server, processes it, and paints the UI that the user sees. In server rendered applications, on the other hand, the first render of a web page is done on the server. The browser receives a pre-rendered page, which it can display without running any JavaScript. This enables better SEO exposure, since many web crawlers cannot run JavaScript, and faster perceived page load times.

There are also some downsides to server side rendering. These include slower server response time and, in lower bandwidth environments, slower time to interactive. For apps that run behind login screens, whose content is private, these downsides might make server side rendering less than worthwhile. For our use case, however, the benefits well outweigh the costs. Most of our app’s pages are public facing, so exposure to web crawlers is essential.

## Preliminary Considerations

Implementing server side rendering is not a trivial task. In response to this fact, a number of libraries have emerged to make implementation a bit easier. These include Next.js, Razzle, numerous boilerplates, and others.

These libraries and frameworks can be a good choice for rapidly prototyping a feature or when starting a new app, but I would not recommend them for use in production or for extant apps. The reason for this is that using them requires surrendering a large portion of your codebase to them, which makes debugging and optimization more difficult, if not impossible, and makes you ignorant of how your app is really working. What’s more, integrating such a framework into an extant application is often more trouble than it’s worth.

Therefore, I developed a custom implementation of server side rendering at Meural. I hope that our stack is similar enough to that of other companies so that other developers might find this article useful. Our frontend uses React, React Router 3, and Redux, while our backend is a monolithic Django application.

## The High-Level View

At a high level, setting up server side rendering consists in setting up the following chain of events.

![SSR Schema](/assets/ssr.jpg)

Since our primary application server is a Django application, which cannot understand JavaScript, we need a JavaScript runtime to render our React frontend. For this, we’ll use a Node server. When a request hits our primary Django server, we’ll query our database to get the info we need. Next we’ll send that info in an HTTP `POST` request to our Node server, which will return our markup, plus the final state of our Redux store. Finally, we’ll embed this information into the HTML response of our Django app and send it to the client.

## Node-Django Interaction

Let’s begin by setting up the Node server. I decided to use Express.js because it is battle-tested and very easy to use. Note that we are reading our `NODE_HOST` and `NODE_PORT` variables from our runtime environment.

<script src="https://gist.github.com/AlexanderRichey/96cdba8e8171d0a6bfa239b5a42db3f9.js"></script>

I recommend writing a simple `render` and `buildInitialState` functions for testing purposes that simply return some valid output of any kind. I also recommend testing this server with cURL before moving on to anything else.

Now let’s wire up the Django app and test it’s interaction with the Node server.

<script src="https://gist.github.com/AlexanderRichey/109eb5d4730be1f88fb894c05e00df03.js"></script>

Here’s how we insert the rendered HTML payload into our Django template. Note that we use [Webpack](https://webpack.js.org/guides/getting-started/) and [django-webpack-loader](https://github.com/ezhome/django-webpack-loader) to handle our client-side JavaScript.

<script src="https://gist.github.com/AlexanderRichey/925151a5fa26bd076fe37263007ff60d.js"></script>

We can now test the interaction between Node and Django. Let’s start the Node server and the Django server, open up a browser, and go to the url that corresponds to our sandwich view. To prevent our React frontend from taking over the page on load, we’ll disable JavaScript in DevTools. If you see a page with the output that you defined in your `render` and `buildInitialState` functions, then all is well.

## Defining the Render Function

It will be instructive to first look at the code of the `render` function and then to explain how it works.

<script src="https://gist.github.com/AlexanderRichey/df4c27427936ae186b3725a8c1fee7d6.js"></script>

The first thing the `render` function does is configure the Redux store. I used the same `configureStore` function that I had already defined in following the usual Redux API pattern.

The second thing the `render` function does is get the frontend routes of my React app, by calling a function I wrote called `getRoutes`. This function takes the Redux store as an argument and returns all of the routes to my app. It prevents code duplication because I can call it in both server and browser environments (See the _Handling the Client Side_ section below to see how it is used in a browser environment).

The name `getRoutes`, though accurate, is somewhat incomplete. The function does not just get routes. It also gets the React components of which my app is composed, since they are embedded in the definitions of the routes themselves. Therefore, the `getRoutes` function is what links my existing React app to the render function.

Next, in order for the `render` function to match the desired route, I use React Router’s `match` function. This function’s first argument is an object containing all of my app’s routes as its first key — which we have from the `getRoutes` function — and the desired route as the second key. The match function’s second argument is a callback that gets evoked after matching is complete. In a successful matching, this callback’s third argument is a `renderProps` object. These `renderProps` represent the state of my app’s props at a given route. I pass this object into React-Router’s `<RouterContext>` component (which is a static version of its more familiar `<Router>` component) to render the state of our app at the matched route.

To give the components of my app access to the Redux store, I wrap the `<RouterContext>` component with the `<Provider>` component from the React-Redux library.

Next, I call `ReactDOMServer#renderToString` with this wrapped component as its argument to render the state of my application at the matched route to HTML.

Finally, I call `getState` on my Redux store to extract its final state in case the rendering process changed anything.

If the match function fails to match the desired route, the second argument of its callback is a `redirectLocation` argument. In this case, I recursively call the `render` function with this new desired route. I am confident that there will never be a chain of infinite redirects because I have defined a wildcard route to handle such cases.

## Calling the Render Function

The render function will not work as it is currently defined. The reason for this is that the JSX used in the function itself, as well as in the rest of my app, is not understood in Node runtimes. Therefore, I use Webpack and Babel to transpile my `render.jsx` file into Node compliant code. All I had to do to make this work was to copy my existing webpack config, change the entry point to `render.jsx`, and replace the target parameter with `target: ‘node’`.

When transpiling, I ran into some errors. Since this version of my React app will not be running in the browser, window and document will not be defined. Therefore, I had to move all references to `window` and `document` to functions that are executed only after the DOM is accessible. This involved moving references to `window` and `document` from methods like `Component#constructor` to methods like `Component#componentDidMount`. Unlike `Component#constructor`, `Component#componentDidMount` will only be called after the component has been mounted to the DOM. I also had to abandon some third-party libraries that relied on `window` or `document` in problematic places.

## Handling the Client Side

Now that my server responds with a fully rendered page of my app, I need to adjust my client side JS to expect this. Here’s the code I wrote.

<script src="https://gist.github.com/AlexanderRichey/c6f0bf438ff2f6c8b8a4fc74e41658c5.js"></script>

You might have noticed that I added an `async` attribute to my script tag in `base.html`. The `async` attribute makes the tag non-render-blocking, which means that the browser won’t wait for the entire script to download before rendering. This produces a considerable speed increase, especially with large JavaScript bundles. However, it also means that it is possible for the script to be executed at any time during the load process, which means that the standard procedure of waiting for `DOMContentLoaded` before rendering with ReactDOM might not always work, since `DOMContentLoaded` might have already fired, in which case, the React app would never get executed and the page would never become interactive. Therefore, I check the `document.readyState` when the bundle is initially executed. If the `readyState` is `complete` or `interactive`, I initialize my React app right away. Otherwise, I add listener for `DOMContentLoaded` and use my initialize function as the callback.

In my `initializeApp` function, I get the current state of the Redux store from the window and pass it into `configureStore` to setup Redux. Next, I match the current route, just as I did on the server side, using the same `getRoutes` and `match` functions which I discussed above. Instead of calling `ReactDOM#render`, which is the usual pattern in client rendered apps, I call `ReactDOM#hydrate`, which sets up React’s virtual DOM and installs listeners to make the page interactive.

## Conclusion

Since deploying this project, we have seen much better SEO at Meural. Now a Google search for the terms `meural` and some artist’s name will yield a result of that artist’s page or one of her playlists, if that artist is in our collection. Prior to this deployment, this was not possible, since we had exposed only one webpage, which contained our single-page React app.
