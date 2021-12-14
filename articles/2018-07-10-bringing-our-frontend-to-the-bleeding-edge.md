---
layout: post
title: Bringing Meural's Frontend to the Bleeding Edge
date: 2018-07-10
description: When we decided to redesign our flagship web app at Meural, we took the opportunity to rethink our approach to React...
---
<div class="message">
My article on <a href="https://my.meural.com">my.meural</a>'s redesign originally published on Meural's <a href="https://medium.com/meural-product-development/bringing-our-frontend-to-the-bleeding-edge-dc81b89f8d14">Product Blog</a>.
</div>

When we decided to redesign our flagship web app at Meural, we took the opportunity to rethink our approach to React and other frontend infrastructure. We ultimately decided to migrate from our own home-cooked server side rendering solution to Next.js, to change our approach to data handling with Redux, and to adopt styled-components. These decisions enabled us to develop and deploy our new frontend in just two months. In this article, I’ll talk about the upshot of these choices and about how things have worked out in production.

## Next.js

Next.js is a framework for React apps that handles both server and client-side code. It offers a number of features, including server side rendering and automatic code-splitting in production; and hot module replacement in development. I know [from experience](https://medium.com/meural-product-development/setting-up-server-side-rendering-with-react-redux-and-django-4d6f4d2fd705) that implementing these features from scratch is far from trivial. Therefore, the notion of starting a new project with Next.js at the foundation was attractive.

In addition to these flagship features, there are also positive externalities. Since Next.js is open source and has an active community behind it, common problems are faced at the community-level and standard, well-tested solutions emerge. These solutions can be found in the [Next.js repo](https://github.com/zeit/next.js/tree/canary/examples) in a folder called `/examples`. Inside are skeleton projects with commonly desired integrations such as with Redux, styled-components, and others. Having these examples available significantly reduces mental overhead in implementing such integrations in one’s own project. This accelerates development as a result.

The price one pays for these features is to surrender control of routing and considerable portions of application architecture and configuration. Next.js jettisons the de facto routing standard of React-Router and requires your React application to be divided into what it calls pages. A page is a top-level React component that is associated with a URL. The notion of a page is also what enables automatic code-splitting — bundles are split at each page and preloaded on the client with `<link rel="preload">`.

We decided that the features of Next.js, coupled with its positive externalities, outweigh the loss of control of our application architecture. Moreover, we found that adopting Next.js’ architecture simplified our application. By distinguishing between pages — those are, top-level components — and ordinary components, the directory structure of our frontend codebase became more easily comprehensible.

## Redux

One of the challenges we faced in adopting Next.js is how to persist data across pages. Since Next.js’ architecture is based on pages, and since pages themselves are React components, which are unmounted on navigation events, their state is lost with every page navigation. We solved this problem by persisting state across page navigation events in a Redux store. What’s more, we broke away from standard Redux use patterns by using it only for persistent data.

Roughly speaking, use patterns of Redux can be placed on a continuum where, at one extreme, every bit of application state is stored in Redux and every mutation of state is achieved through a Redux action. At the other extreme, state is managed entirely at the component level and there is no store of global state.

In our previous frontend, we tended toward the former use pattern. This pattern offered some advantages — all data was fetched consistently through Redux actions with [Redux-Thunk](https://github.com/reduxjs/redux-thunk); and every connected component could gain visibility to any other area of the application. But we decided to abandon this approach for two main reasons. First, the excessive boilerplate that Redux requires makes extending functionality more work than it needs to be. Second, we often found ourselves dispatching actions that essentially mimic ordinary component lifecycle methods. For example, suppose that on `componentDidMount`, I fetch some data and save it in the Redux store. Then, in order to prevent the user from seeing stale data when this component loads again, I dispatch an action that clears this area of the Redux store on `componentWillUnmount`. It seems much simpler to store this data in the component state, where it will be naturally destroyed when the component unmounts and naturally fetched on `componentDidMount`, than to store it in the Redux store where it needs to be manually destroyed.

These considerations led us to the strategy of using Redux only for data that is truly global. As a result, we now have an extremely thin Redux store that stores only user, device, and configuration data. All other data is fetched and managed at the component level. We’ve found that this approach both makes our React components easer to comprehend and dramatically reduces boilerplate.

## Styled-Components

The final change to our frontend stack was to adopt styled-components. In some ways, styled-components represent the terminus of a new paradigm in web development. In the old paradigm, the best-practice was to keep markup, JavaScript, and styling separate, on the grounds that these were separate concerns that should be isolated from each other. React changed this by bringing markup into JavaScript which made programmatically rendering markup less cumbersome and more easy to reason about. Styled-Components takes the philosophy that React developed and extends it to styles. It brings styling into JavaScript as well, where it can also receive the benefits of programmatic handling. The result of these developments is that concerns are grouped by component rather than by language.

Prior to using styled-components, our strategy was to include a sass file for every component and to bundle everything together with Webpack’s sass and css-loaders. This strategy was successful, but it often made styling components overly cumbersome. There were also the typical issues of globals and specificity in css.

Adopting styled-components solved these problems for us and, more significantly, it has made predicting and reasoning about the visual behavior of each component easier. We now keep all of the code related to one component in a single `.jsx` file that contains markup, JavaScript, and styling. This makes each component much easier to comprehend and, from a logistical point of view, easier to change because one no longer needs to open three or four files at the same time to handle just one locus of behavior. Now, I can open several components at once and think about their interrelations and the signatures that each one should have. In other words, I can reason about the application in a more abstracted and powerful way.

## Production

The strategies that I described above enabled the web team at Meural, which, at the time, consisted of myself and one other developer, to build and deploy our new frontend in just two months. I believe that our focus on reducing mental overhead by making our codebase easier to comprehend enabled us to deliver on schedule. Nevertheless, we have noticed some issues in production.

The primary issues that we have seen are related to performance and stem from Next.js and styled-components. For all of their virtues, the combination of Next.js and styled-components creates large JavaScript bundles. At the time of this writing, our `main.js` bundle is just under 800kb and other split bundles range from less than 10kb to more than 100kb. This increased our page time to interactive from under 2.5 seconds to over 5 seconds, which is not acceptable.

With gzip, we can reduce the size of these bundles by roughly 75%, which would get our page load time back into an acceptable range. The problem is that Next.js does not serve static files in a straightforward way. Static assets are built and saved to the `/.next` directory, but the directory structure does not match the URLs that the client requests. These requests must be routed through the Next.js application to be resolved to the correct static asset. This prevents us from easily gzipping and serving these files independently from the Next.js application.

The solution that we developed is to leverage NGINX’s [caching capabilities](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache). For many reasons, we run our Next.js application behind an NGINX server. We decided to use the `proxy_cache` directive to cache responses at the `/_next/` location. The way this works is that the first request for any asset at `/_next/` will be forwarded to the application with `proxy_pass`, but the resulting response will be saved in NGINX’s cache. Subsequent requests will then be served out of the cache. Here are the relevant parts of the configuration.

```nginx
http {
    # Cache setup

    proxy_cache_path /data/nginx/cache keys_zone=one:20m; 
    proxy_cache_valid 200 60m;

    # Gzip settings

    gzip_static on;
    gzip on;
    gzip_comp_level 5;
    gzip_types application/javascript ...;
    gzip_min_length 1000;
    gzip_proxied expired no-cache no-store;

    server {
        listen 80;

        # ...

        location /_next/ {
            proxy_pass http://application:8000;
            gzip_proxied any;
            proxy_cache one;
            break;
        }

        # ...

    }
}
```

## Conclusion

We have been running our new frontend stack in production for a little over two months and, so far, have had an easy time updating and extending our application. All of the decisions we made regarding Next.js, Redux, and styled-components seem to have paid off and it has been easy to live with the few inflexible areas of Next.js. After we deployed our new NGINX configuration, page load performance was restored to our target range and our application, at least in my opinion, has a wonderful, speedy, and modern feel.

