---
title: 'Migrating my photography site from Eleventy to Astro'
description: 'I just migrated my old photography portfolio from Eleventy to Astro. This is an in-depth guide where I share the process and discuss how some of Eleventy’s features translate to Astro. It’s intended to be helpful to anyone working on a similar migration, or just looking to solve problems with Astro.'
seo_description: 'In-depth guide on migrating a photo-heavy portfolio website from Eleventy to Astro.'
---

I recently finished a complete rebuild of my photography portfolio site from [Eleventy](https://www.11ty.dev/) to [Astro](https://astro.build/). In this article, I want to document the process and share some insights I had along the way.

This is the finished site: [mehrlicht.photos ↗](https://mehrlicht.photos/)

I finished the first version of the site by February 2021. The site was built on Eleventy and hosted on [Netlify](https://www.netlify.com/). It worked well, but was relatively fragile, and adding photos was somewhat cumbersome. The photos themselves were tracked via [git lfs](https://git-lfs.com/) and hosted on [Netlify Large Media](https://docs.netlify.com/build/git-workflows/large-media/overview/), which also provided image transformations for responsive images. This feature has been deprecated for a while now, and the rest of the tech stack was showing its age as well.

The new site is built with Astro and hosted on Cloudflare. It’s a completely static site, so the site is deployed via Cloudflare Pages with no workers or dynamic endpoints.

## From Eleventy to Astro

As a reference, you can compare the [current source code](https://github.com/MoritzLost/MehrLicht) with the [previous Eleventy version](https://github.com/MoritzLost/MehrLicht/tree/pre-2026-eleventy) on GitHub.

To start off, I removed the dependency on `@11ty/eleventy` and all the related libraries from my `package.json`. The next step is to install `astro` and `@astrojs/check` (for TypeScript checks before the build) and update the `scripts` to develop and build the site with `astro`. Add a basic `astro.config.ts` and a `tsconfig.json` with the necessary configuration to use TypeScript with Astro. To make this easier, you can run `npm create astro` in an empty directory, using the empty basic template, and copy some files over from there.

Finally, I added a plain `src/pages/index.astro` with a _Hello, World_ page. At this point, all the content and files from `site/` (the main directory used in the Eleventy project) are ignored and Astro just serves the homepage from `src/pages`. Now I can port over everything from the old `site/` folder to `src`, step-by-step.

<aside>

The Eleventy site was pretty outdated, and I haven’t kept up with the newer major versions. Some of the workarounds and custom solutions I used back when building the site may no longer be necessary, and there may be better built-in options and plugins available. I want to explore the process of moving from Eleventy to Astro – but the focus is on what Astro provides, not on badmouthing Eleventy.

</aside>

### Migrate first, update later

I also had a number of content and design changes I wanted to do. However, for a full migration, I find it easier to first rebuild the site as is first. This way, you can convert pages and templates one by one, and compare the result with the live site. This way, you can spot any unintended changes, missing pieces, or broken components easily. Once the sites look identical and everything is working correctly, you can move on to content and design changes.

### Passthrough copy to public folder

To copy static assets in Eleventy, you can use [passthrough file copy](https://www.11ty.dev/docs/copy/), which just copies the specified files from a source directory to the target directory in the build output. I used this to copy static assets (like the favicon, other icons, the manifest, and all the photos themselves) to the build folder:

```js
eleventyConfig.addPassthroughCopy({
	'site/assets': 'assets',
	'site/root-assets/*': '.',
	'site/photos': 'photos',
});
```

With Astro, you can just use the `public/` folder in the project, which is used for [assets that are not processed in any way](https://docs.astro.build/en/basics/project-structure/#public). For the photos, specifically, I moved them to `src/photos/` instead, since the new site will import them as images, in order to use Astro’s [image processing pipeline](#image-processing).

### No more separate build step

Eleventy doesn’t include a processing pipeline for CSS and JavaScript (though there are some options now to add this through plugins or the config). So originally, I used [separate build commands](https://github.com/MoritzLost/MehrLicht/blob/pre-2026-eleventy/package.json#L16-L27) for SASS and JS and chained those after the Eleventy build:

```bash
npm run build:eleventy && npm run build:sass && npm run build:parcel
```

Since Astro is built on [Vite](https://vite.dev/), this can be removed. Instead, you only need to import the main CSS (or in my case, SASS) and JS/TS files somewhere in an Astro component, and Vite will automatically process them.

As with every SASS project that hasn’t been worked on in more than a couple of weeks, the build was immediately littered with tons of deprecation warnings. Since I planned on rewriting lots of the SASS styles anyway, I started by silencing those warnings temporarily, to get rid of the noise:

```ts
// astro.config.ts
vite: {
	css: {
		preprocessorOptions: {
			scss: {
				quietDeps: true,
				silenceDeprecations: ['if-function', 'color-functions', 'global-builtin', 'import'],
			},
		},
	},
}
```

## Content can (mostly) stay

Surprisingly, the content didn’t have to go through many changes. The bulk consisted of around [30 photo projects](https://mehrlicht.photos/#photos-by-project), which were in the repository as Markdown files with some [Nunjucks](https://www.11ty.dev/docs/languages/nunjucks/) syntax sprinkled in. Those can have frontmatter in YAML, which is identical to frontmatter in Markdown files in Astro. I only dropped the `tags` and `layout` properties, since those are only used by Eleventy (see below for the replacement for those features).

The content itself used some Nunjucks syntax, but only to output the photos for the project through a [macro](#macros-to-collections). I removed the macro and instead added a frontmatter property with a list of the photos for the project, to be output later via the [Astro project page](#layouts-to-layout-components).

All that’s left was to move the projects folder from `site/projects/` to `src/content/projects` and then define a collection for it.

### Tags to collections

To group content into sorted collections, you can use [tags](https://www.11ty.dev/docs/collections/) in your content files. Eleventy will automatically create a collection for every unique tag with all the files that have this tag. Files can also have multiple tags, so they can be part of multiple collections. You can also define your own collections through the [Collections API](https://www.11ty.dev/docs/collections-api/).

This is surprisingly close to what Astro provides with [content collections](https://docs.astro.build/en/guides/content-collections/). After moving the markdown files to `src/content/projects`, the collection can be defined via the `glob` loader:

```ts
const projects = defineCollection({
	loader: glob({
		pattern: '*.md',
		base: "./src/content/projects",
	}),
});
```

All that’s left is to [define the schema](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema), which is not supported in Eleventy (without plugins). 

I also added collections for the [curated subject pages](https://mehrlicht.photos/#photos-by-subject) and the [photo blog](https://mehrlicht.photos/blog/).

### Data to collections

Eleventy has a [dedicated place for shared project data](https://www.11ty.dev/docs/data-global/) that will be available to every template through a simple API. In Astro, you can either use regular TS or JSON files, or define a collection as well.

I used a JSON file for the contents of the photo blog and created a collection based on that. The file didn’t need any changes, I just moved it from `site/_data` to [`src/content/blog.json`](https://github.com/MoritzLost/MehrLicht/blob/main/src/content/blog.json). The corresponding collection is defined using the `file` loader:

```ts
loader: file('src/content/blog.json')
```

However, that led to the following problem.

### Content collections require unique IDs

Collections in Astro require a unique ID for each item. The loader function can either return an object where the keys are the ID and the values are the content, or an array of objects which all have an `id` property. The problem is that my blog post data doesn’t include an ID:

```json
// blog.json
[
    {
		"date": "2025-08-29Z",
		"image": {
			"file": "./photos/2025/DSCF2921.JPG",
			"alt": "Low waves are lapping towards the shore, a small sailboat is visible on the horizon."
		},
		"caption": "Norderney, Germany."
	},
	// More blog entries …
]
```

Given the above loader, this will just result in an error due to the missing ID. But the blog posts don’t have their own URL (there’s just a blog index page with all posts), and I didn’t want to have to add arbitrary IDs to the blog posts. Using the date didn’t work, since I had a couple cases where I had more than one image on a given date.

Luckily, the `loader` method has a `parser` function to modify how the file content is parsed into collection items. I used that to just derive an ID for each blog post on the fly:

```ts
parser: (json) => {
	const content = JSON.parse(json);
	return content.map((entry: any, index: number) => ({
		id: `${String(index).padStart(4, '0')}-${entry.date}`,
		...entry,
	}))
}
```

Solid API design!

### Dates in the filename

One Eleventy feature that Astro lacks is automatically generating [content dates from the file name](https://www.11ty.dev/docs/dates/#setting-a-content-date-in-front-matter) for collection items. My projects files are named like this: `2024-08-12-bruges-triennial.md`, `2022-09-23-loch-lomond.md`. Eleventy will automatically parse that date and add it as metadata to the content. Astro does not do that, but you can achieve a similar thing in two steps:

1. Add a [remark plugin](https://github.com/MoritzLost/MehrLicht/blob/main/src/utils/content-frontmatter.ts) that will parse the filename and add the date as metadata to the frontmatter (this is how you can do computed fields in Astro in general).
2. Override the `generateId` function in the `loader` to strip the date from the ID:

```ts
loader: glob({
	// …
	generateId: ({ entry }) => entry.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
}),
```

You end up with content IDs like `bruges-triennial` and `loch-lomond` that you can use in URLs, but have the date available to the template through the frontmatter.

### Default sort order for collections

Another thing that Eleventy does is provide a [default sort order](https://www.11ty.dev/docs/collections/#sorting). If you set a date on your content, the collection will be automatically sorted by date in ascending order. You can also override the default sort order through the Collections API.

Astro’s content collection don’t support any default sort order at the time of writing. In fact, the sort order is explicitly ["non-deterministic and platform-dependent"](https://docs.astro.build/en/guides/content-collections/#querying-build-time-collections). That means you pretty much always have to sort the collection items manually. To avoid repetition, you can create [wrapper functions that return a specified collection in your preferred sort order](https://github.com/MoritzLost/MehrLicht/blob/main/src/utils/collections.ts).

### The existing order in your content files is not guaranteed, either

I have one dedicated page where I just display [my favorite photos](https://mehrlicht.photos/favourites/) across all projects and subjects. The content of that page is defined through a `favourites.json` file that is simply an array of file names:

```json
[
    "./photos/2019-10-31-paris/paris_2019_11.jpg",
    "./photos/2024-04-06-spring-in-the-park/spring_in_the_park_01.jpg",
    "./photos/2023-08-31-zauberwald/zauberwald_06.jpg",
    // …
]
```

The order of the photos is important here, because I want to display the photos in that order. However, as mentioned above, Astro doesn’t guarantee the sort order of a collection that is returned by `getCollection()`. However, since the collection is just an array of filenames, there’s nothing readily available to sort this collection by. I’d need to load the original JSON and then use the index of the photo in that file, which felt redundant.

The workaround I came up with is to, again, derive an ID using the `parser` function for the `file` loader, and make sure that the IDs are in ascending order:

```ts
loader: file(
	'src/content/favourites.json',
	{
		parser: (json) => {
			const content = JSON.parse(json);
			return content.map((image: string, index: number) => ({
				id: `${String(index).padStart(4, '0')}-${image}`,
				image,
			}))
		}
	}
),
```

Then use a [wrapper function](#default-sort-order-for-collections) to return the collection sorted in ascending order by ID:

```ts
export const getFavouritesCollectionInOrder = async (): Promise<CollectionEntry<'favourites'>[]> => {
    const favourites = await getCollection('favourites');
    return favourites.sort((a, b) => a.id < b.id ? -1 : 1);
}
```

Sort of annoying. I’d prefer if you were just able to [specify a default sort order directly on the collection](https://github.com/withastro/roadmap/discussions/1315), and have Astro always return items in that order.

## Templates

I used only [Nunjucks templates](https://www.11ty.dev/docs/languages/nunjucks/) in my original Eleventy build, but it’s worth mentioning that Eleventy actually supports many different template languages, so the steps required to migrate everything over might differ for other sites.

### Layouts to layout components

Eleventy uses a special [`layout` property](https://www.11ty.dev/docs/layouts/) to determine which template to use to render a page. Astro also has a concept of [layouts](https://docs.astro.build/en/basics/layouts/), though in that case it’s just a fancy word for components. Still, the layout files can stay basically the same: I just copied them from `site/_includes/_layouts` to `src/layouts` and changed the extension from `.njk` to `.astro`. Then replace the sprinkles of Nunjucks syntax with [Astro’s template syntax](https://docs.astro.build/en/reference/astro-syntax/).

In Eleventy, layouts can have their own frontmatter, which gets merged with the frontmatter of the page being rendered. This is made more explicit in Astro by accepting [props](https://docs.astro.build/en/basics/astro-components/#component-props) and (optionally) setting default values for them. Defining a `Props` interface is optional, but adds type-safety to layout components.

### Macros to components

In Nunjucks, reusable components can be done through [shortcodes (an Eleventy feature)](https://www.11ty.dev/docs/shortcodes/) or [macros (a native Nunjucks feature)](https://mozilla.github.io/nunjucks/templating.html#macro). I used a lot of macros for [outputting images, image grids, and repeated page elements](https://github.com/MoritzLost/MehrLicht/tree/pre-2026-eleventy/site/_includes/macros). 

Similar to layouts, those just become components in Astro. Again, convert the arguments to props and add the `Props` interface for type-safety. Being able to run JavaScript directly instead of having to work in the very limited Nunjucks template language makes those components a lot simpler. To get a custom function into Nunjucks, you need to [define a filter in the eleventy config](https://github.com/MoritzLost/MehrLicht/blob/pre-2026-eleventy/.eleventy.js#L18-L23) every time. In Astro, you can just inline that logic into the component.

## Image processing

In the Eleventy build, all images were tracked via [git lfs](https://git-lfs.com/) and stored in [Netlify Large Media](https://docs.netlify.com/build/git-workflows/large-media/overview/). That came with some challenges. In particular, there was no easy way to get the actual image sizes in the Netlify build. I ended up with a custom script that runs before each commit (ensured through git hooks) and [writes the sizes of all images to a JSON file](https://github.com/MoritzLost/MehrLicht/blob/pre-2026-eleventy/scripts/get_image_sizes.js). This file is then read by a macro to output `width` and `height` attributes (which is necessary to avoid layout shifts). There might have been an easier way to do this.

Astro actually has pretty [good support for remote images](https://docs.astro.build/en/guides/images/#remote-images). Though I ended up ditching git lfs and now I just keep the files in the repository. I need to compress them slightly to avoid hitting the repository size limit on GitHub, but it is a lot simpler.

### Netlify Large Media to Astro’s image processing

I generate a lot of image variants for responsive images. At the moment, there are around 500 unique images in the repository, and the build generates close to 10,000 image variants. With Netlify Large Media, you can [request transforms on the fly via URL parameters](https://docs.netlify.com/build/git-workflows/large-media/transform-images/).

For the Astro build, I just used the built-in [`<Picture />` component](https://docs.astro.build/en/guides/images/#picture-). A couple of things to note here:

- I wrapped the built-in `Picture` component with a [custom `Picture` component](https://github.com/MoritzLost/MehrLicht/blob/main/src/components/Picture.astro) to set some defaults so I don’t have to repeat myself. For example, I always want to generate AVIF and WebP formats for every image, and set the `quality` to `high`.
- The picture component also knows about the possible layout combinations on the site. Every page on the site can have two parameters that define the layout. A `width`, which is one of `base`, `wide` or `full`. And a `layout`, which can be set to one, two or three columns. With those parameters, the picture component uses a [utility function](https://github.com/MoritzLost/MehrLicht/blob/main/src/utils/responsive-images.ts) to determine the correct `sizes` and `srcset` to output.

### Optimizing the build time

I hit a wall trying to build and deploy the site on Cloudflare Pages, because [builds time out after 20 minutes](https://developers.cloudflare.com/pages/platform/limits/#builds). With around 10,000 image variants to generate, the build was aborted before it could finish. Caching doesn’t help if the initial build can’t complete successfully.

Now the site is built and deployed via a [GitHub Action](https://github.com/MoritzLost/MehrLicht/blob/main/.github/workflows/deploy.yml). This works, because Actions can run for much longer. However, the build still took around 60 minutes, which is annoying.

Astro already caches images in the `/node_modules/.astro` directory (by default). However, actions run in isolated environments, so consecutive builds don’t have access to the caches generated by a previous run. This is where the built-in [`actions/cache` action](https://github.com/actions/cache) comes in. The action saves the `.astro` folder to a cache and restores it on subsequent builds. This way, the build can just reuse the previously generated transforms. See the [workflow file](https://github.com/MoritzLost/MehrLicht/blob/main/.github/workflows/deploy.yml) for details.

Now a build with a warm cache only takes around 90 seconds!

## Finally – grid lanes

This isn’t really related to Astro or Eleventy, but it’s still pretty cool. I wanted a masonry-style grid layout for the subject pages. For a long time, the only way to do this was either use a JS library like [masonry](https://masonry.desandro.com/) (annoying and causes layout shifts) or [CSS columns](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/columns). I used the latter. The main problem with that is that images are laid out column-by-column, which is unexpected and not how people view the page.

But now, we can finally use `display: grid-lanes` for [native masonry layouts](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Masonry_layout). Well, sort of. At the time of writing, it’s [only implemented in Safari 26.4+](https://webkit.org/blog/17660/introducing-css-grid-lanes/). If you open the page [Animals & Nature](https://mehrlicht.photos/nature/) in a current Safari version, two cool things happen:

- The images are actually laid out from top to bottom. The algorithm puts each image in the shortest column, then moves on to the next one.
- Some images break out of the grid and span multiple columns. This makes the page much more interesting to look at.

Browsers that don’t support this yet just get the fallback to CSS columns. See the [CSS styles](https://github.com/MoritzLost/MehrLicht/blob/main/src/styles/4-components/_photos.scss) for details.

## Conclusion

**Static site generators are sustainable.** You get a fully static site that can just stay online until the heat death of the universe. No node or PHP process needs to spin up on the server and waste energy to generate the same page over and over. You never have to worry about security, because there’s no attack surface at all. Your visitors enjoy super fast loading times, because you can’t beat static files. It’s the perfect option for a site you don’t want to maintain and update regularly, or that may be on life support for years at a time.

**Content in the repository is great.** Because all the content was in the repository, I didn’t have to do a messy export out of an outdated CMS and try to wrangle that into a new format. I could just reuse most of the content and only have to do minor updates. And even sweeping changes are easy to do, either via bulk editing in the code editor, or via AI tools. In fact, the biggest hurdle was getting all my photos out of Netlify Large Media, which has been deprecated for a while, and the tooling doesn’t really work anymore. Frameworks come and go, but content stays.

**Astro is cool.** For content-driven sites, Astro comes with a lot of features that you end up needing. For example, I really like that it automatically gives you a list of headings for every rendered Markdown content. I didn’t use that on the photo site, but it _is_ used to generate the table of contents for this article. Features around image handling and a solid API for type-safe content collections make for a delightful developer experience.
