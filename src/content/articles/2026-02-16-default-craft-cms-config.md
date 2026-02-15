---
title: 'My default config for new Craft CMS projects'
description: 'I share my full general config that I use as a starting point for all Craft projects. Filled with useful little tips for how to make your life a bit easier. May include wildly controversial takes.'
seo_description: 'My annotated default configuration for new Craft CMS projects. May include wildly controversial takes.'
---

Craft CMS comes with a load of general configuration options to match specific project requirements and your personal preferences. In this article, I want to share my default configuration that I use for all new Craft projects.

My default configuration is intended as a starting point for every project. On smaller projects, I don’t want to have to change anything, unless there’s a concrete need or the client asks for something very specific. So here’s the pitch for this article: I’ll post my _entire_ `config/general.php` in the code snippets below, followed by explanations why I prefer those settings.

I won’t explain what every setting does. Instead, I’ll focus on _why_ I prefer the options that I use. You can find the explanation and default values of all the [general configuration options in the Craft documentation](https://craftcms.com/docs/5.x/reference/config/general.html). Anything not in the list is left at the default value.

## Setup

```php
<?php

use craft\config\GeneralConfig;
use craft\helpers\App;
```

Obvious stuff, really.

```php
$environment = strtolower(App::env('CRAFT_ENVIRONMENT'));
$isDev = $environment === 'dev';
$isStaging = $environment === 'staging';
$isProduction = $environment === 'production';
```

Some options will depend on the environment, so I determine the environment and set some shortcut variables for convenience.

```php
$config = GeneralConfig::create()
```

Always use the [fluent config syntax](https://craftcms.com/docs/5.x/configure.html#style). The array syntax has only downsides, while the fluent syntax has only upsides. You get inline type annotations, editor autocompletion, and type errors if you misspell a method name or when a config is removed as part of a major Craft update.

## The configuration

```php
->allowAdminChanges($isDev)
```

Never, _ever_ enable admin changes in production. This is the _only_ correct value for this setting.

By the way, the options are in alphabetical order.

<aside>

Quick tip: If you don’t want to maintain the order manually, select all lines with config options. Then open the command palette in VS Code and run the command **Sort Lines Ascending** (or the equivalent in your editor of choice).

</aside>

```php
->cacheDuration(2_419_200) // 28 days
```

The default is one day, which is very conservative for a lot of caches, especially the template cache. As long as you ensure all cache dependencies can be tracked in your `{% cache %}` tags, a longer cache duration shouldn’t be a problem. With custom cached data, you can always use a shorter cache duration where appropriate.

<aside>

Two sidenotes that apply to all numeric values:

- The [numeric literal separators](https://www.php.net/manual/en/migration74.new-features.php#migration74.new-features.core.numeric-literal-separator) helpfully improve the readability of large numbers.
- There are inline comments with a human-readable version of numeric options that are difficult to parse at a glance. A downside of this is the possibility of those comments becoming outdated when you change the value. But that issue is very easy to spot in a pull request, and [Copilot’s next edit suggestions](https://code.visualstudio.com/docs/copilot/ai-powered-suggestions#_next-edit-suggestions) are useful for this as well.

</aside>

```php
->convertFilenamesToAscii(true)
```

This prevents some issues with some servers, and the URLs also look nicer, which is admittedly subjective.

```php
->cpTrigger('cms')
```

When authors look for the CMS, they find it. It’s also shorter to type than `admin`.

```php
->defaultCountryCode('DE')
->defaultCpLanguage('de')
```

We’re located in Germany, so that’s a no-brainer. Very useful settings if you or your clients are outside the United States.

```php
->defaultImageQuality(75)
```

We use AVIF with a fallback to WebP for all images by default. AVIF compresses very well, so you can go a bit lower with the default quality.


```php
->defaultTokenDuration(604_800) // 7 days
```

We found that some links with tokens expire a bit too quickly with the default (1 day).

```php
->defaultWeekStartDay(1) // Monday
```

The week starts on Monday.

```php
->devMode($isDev)
```

Only enable dev mode features in dev mode, obviously.

I like the shorthand variables for the environments because they read almost like plain English.

```php
->disallowRobots(!$isProduction)
```

This instructs crawlers not to index the site in any environment that’s _not_ production. This is very useful so your staging sites never end up in any search engine’s index, even if they’re not behind basic authentication.

```php
->elevatedSessionDuration(900) // 15 minutes
```

Again, the default of five minutes is a bit short. If you have to regularly manage user accounts, constantly having to enter your password gets old fast.

```php
->enableTemplateCaching($isDev ? false : empty($_GET['nocache']))
```

In dev environments, template caching is disabled so you never see cached output. If I need to test the cache behaviour, I just temporarily change the environment to `production` to simulate the full behavior of the production environment. For other environments, I’ve added a sneaky little trick: When the URL includes a query parameter `nocache`, template caching is turned off. This can be used as part of the `action` attribute of a form, to ensure that the target page correctly displays success or error messages, in cases where the form is cached. Or as a quick little tool to see the live output of a page when you need to debug something in production.

Note that this opens up a potential vulnerability: An attacker could execute a DDoS attack by repeatedly requesting pages with that query parameter, forcing your server to render a lot of full pages without template caches. But I haven’t actually seen that happen on any site yet, so for now it can stay.

```php
->errorTemplatePrefix('errors/')
```

I prefer having error templates in a subdirectory. They’re not needed or modified very frequently, so they take up a bit too much space in the template root directory.

```php
->handleCasing(GeneralConfig::SNAKE_CASE)
```

When we started working with Craft, we decided to keep using `snake_case` for all handles. I still think it’s easier to read. That said, I’m not sure I like that this goes against all the examples in the documentation and most third-party resources. But once you maintain a couple dozen projects like this, changing it becomes unpractical.

```php
->limitAutoSlugsToAscii(true)
```

This is mostly personal preference.

```php
->maxUploadFileSize(67_108_864) // 64 MB
```

The default is 16 MB, which you exceed very quickly with some larger PDFs or videos.

```php
->omitScriptNameInUrls(true)
```

You never want `index.php` in the path. That’s bad for SEO and also user experience. The URL is part of the user interface and shouldn’t include technical details. Also, [cool URIs don’t change](https://www.w3.org/Provider/Style/URI).

```php
->partialTemplatesPath('partials')
```

Same as the default, but without the underscore prefix. See `privateTemplateTrigger`.

```php
->preloadSingles(true)
```

This allows you to use singles in templates like you could globals: Just refer to them by name, and Craft will load them automatically behind the scenes. Singles are only loaded when they are actually needed with this setting, so it shouldn’t have a negative performance impact.

```php
->previewTokenDuration(604_800) // 7 days
```

This is very useful if you (or your authors) want to send preview links to other people, especially stakeholders that don’t have their own account. If you send those on a Friday, you don’t want them to expire before Monday.

```php
->privateTemplateTrigger(false)
```

This might be the most controversial take in this entire article. I don’t like file-based routing, so I always keep it turned off. I don’t mind it if it’s the _main_ way to do routing, [like it is in Astro](https://docs.astro.build/en/guides/routing/). But in Craft, it’s just one of [several ways to create routes](https://craftcms.com/docs/5.x/system/routing.html), and the least useful one at that. A lot of sites will do fine with mostly entry URLs (generated through the _Entry URI Format_).

The only thing that file-based routing does is save you from having to write _one line_ in your `config/routes.php`. And in turn, it’s really annoying having to always add (and look at) the underscore prefix in a template or folder. All those underscores are just noise.

```php
->rememberedUserSessionDuration(2_592_000) // 30 days
```

Just a bit longer than the default of two weeks. Check this against your security policies.

```php
->requireMatchingUserAgentForSession(!$isDev)
```

This is a useful little trick to make debugging easier. Requiring a matching user agent for sessions is a security feature, so you don’t want to disable it in production or staging. However, it can mess with your local development. If you use the mobile simulation in your browser to test something and then reload, you might be treated as a guest. That’s because the simulation will also send a different user agent by default. So allowing the session to stick around when the user agent changes prevents this issue.

```php
->revAssetUrls(true)
```

That’s very useful to bust any browser caches if an asset is replaced in the CMS. This also allows you to confidently set a long `Cache-Control` duration for assets.

```php
->runQueueAutomatically(false)
```

[Always use a queue runner.](https://putyourlightson.com/articles/queue-runners-and-custom-queues-in-craft-cms)

```php
->sameSiteCookieValue('Lax')
```

If you don’t set this, some browsers will enforce a more strict setting by default. This can mess with active sessions and logins. This is a good general default, and can still be changed on a per-case basis.

```php
->sendContentLengthHeader(true)
```

Just good practice, really. Without this header, browsers can’t show the progress and remaining time on a download.

```php
->transformGifs(true)
```

GIF is a terribly inefficient format for images on the web, so you want to generate AVIF or WebP alternatives from them. This will break animated GIFs. Which is good, because you also shouldn’t be using animated GIFs. For anything where an author might want to use an animated GIF, a video will be the better solution.

```php
->transformSvgs(false)
```

There’s really no need to transform SVGs since they can scale infinitely (it’s in the name, after all).

```php
->upscaleImages(false)
```

If authors upload tiny source images, upscaling won’t do them any good. Instead, educate your authors on recommended image sizes and/or enforce minimum sizes through field conditions.

```php
->useEmailAsUsername(true)
```

Unless you have very specific requirements for frontend user accounts, this will make it easier for everyone to log in and recover their accounts if they forget their password. The username is just an additional thing to remember. You can have any number of usernames on different sites, but most people use only one or a few different email addresses. Especially if you’re building sites for businesses, and authors use their employee email.

```php
->verificationCodeDuration(604_800); // 7 days
```

Same as with preview tokens. If you generate a password reset link for authors and send it by email, you don’t want it to expire by the next day.

## Aliases

```php
$config->aliases([
    '@webroot' => dirname(__DIR__) . '/web',
    '@modules' => dirname(__DIR__) . '/modules',
    '@public' => dirname(__DIR__) . '/src/public',
    '@base_url' => App::env('PRIMARY_SITE_URL') ?: '/',
    '@fontawesome' => CRAFT_BASE_PATH . '/node_modules/@fortawesome/fontawesome-pro/svgs',
]);
```

Just some useful aliases. Notably:

- The `@modules` alias is important if you just map the `modules\` namespace to the `modules/` folder in your `composer.json`. In this case, you need the alias so Craft can find all the console commands in your modules.
- The `@public` alias goes to the public folder if you use [Vite](https://vite.dev/) as a build tool.
- The `@base_url` is a replacement for `@web`, which you [shouldn’t use in site URLs](https://craftcms.com/knowledge-base/securing-craft#the-web-alias-and-site-uRLs).
- The `@fontawesome` alias allows us to pull SVGs directly from the Font Awesome folder in `node_modules/`.

## Finishing up

```php
return $config;
```

And that’s it!

I’m not sure if there are any grand takeaways here. Some settings are more opinionated than others, and some are just common sense. One recurring theme is being a bit more lenient with allowed inputs, token durations, upload size, etc. That’s to be expected: The defaults of the CMS itself have to be _very_ conservative, since they will have to work for such a wide audience. Since I know that I’m not working on national security, I can err a bit more on the side of convenience.

I also appreciate that there are settings to change some conventions that you wouldn’t necessarily expect. In particular, allowing me to use snake case for generated handles and turning off file-based routing entirely.

Let me know which settings I got completely and utterly wrong.
