---
title: 'Alternative texts in Craft CMS (Working title)'
slug: alt-texts-in-craft-cms
---

As Craft CMS gives the developer full control over content modelling, there are several ways to setup alternative text fields for images. This articles is an in-depth exploration of the different options you have to set your authors up for success when creating alternative text fields, and what you as a developer can do to ensure that your images have accessible alt texts.

This post is **not** intended as a general tutorial on using alt texts, and also not a guide on writing good alt texts. It's specifically for developers that want to optimize their alt text setup in Craft CMS.

## Creating an alt field for assets

Craft CMS comes with the ability to edit the field layout for your asset volumes. You can provide fields for meta data (like an alt text) that is directly associated with an uploaded asset, which can then be reused on multiple pages. This gives you more control over content modeling compared to _some_ other CMS, which come with a media library with a default set of fields that you can't change (without plugins).

Change

In version 4, Craft introduced a [native `alt` property for assets](https://craftcms.com/blog/craft-4). Prior to this, you could only create a custom field. The huge advantage of the native property is that Craft _knows_ that its value is an alt text for the given asset. This is important for [authoring tool accessibility](https://www.w3.org/WAI/standards-guidelines/atag/), i.e. the accessibility of the Control Panel itself. If the native property is used, Craft can use it as the `alt` attribute for `<img>` tags in the Control Panel, for example in the asset index listing.

One downside of the native `alt` property in Craft 4 is that it **isn't translatable**. This means the native property is not a good option for multi-lingual sites, since you need your alt texts in multiple languages. This will be [fixed in Craft 5](https://github.com/craftcms/cms/pull/12525).

If possible, using the native property is advisable, especially if authoring tool accessibility is important to you. To summarize:

- In Craft 3 and below, you can only use a custom field.
- In Craft 4, use the native property unless you need translatable alt fields.
- In Craft 5, always use the native property.

### Only show the alt field for images

You only want to show the alt field for image assets, not for any other file types. You can use different asset volumes, one for images and one for other file types, and only add the alt property to the former. However, you can't limit the file types uploaded to an asset volume. You can only limit the file types for individual [assets fields](https://craftcms.com/docs/4.x/assets-fields.html), so this is a bit error-prone.

In Craft 4, you can utilize field **conditional field layouts** instead. Add the alt text field (or your custom alt field) to the field layout and add an asset condition for [file kind](https://craftcms.com/docs/4.x/assets.html#kind) of `image`. This way, the field will only show up for image assets.

[] Add a screenshot of the settings

## Should the alt text field be a property of the image?

Adding the alt text as a field of the asset itself makes intuitive sense. It's what most CMS - [like WordPress](https://wordpress.com/support/media/#edit-a-media-file) - are doing by default, so authors are used to it. It's easy to developers to set up and handle in code. In Craft CMS specifically, it makes for a nice author experience. You can select multiple assets in an assets field, and open a modal dialog to edit their alt texts as needed, without additional text fields taking up space in the main field layout.

But is this practice actually _correct_?

Adding an alternative text field to an asset assumes that a good alternative text is a **property of the image**. This implies that there is an objectively _correct_ alt text for every image, which is appropriate everywhere the image is used. This assumption is, unfortunately, wrong. A good alt text depends on the **context of the image in the page content**. An alt text never described the entire image, theres simply not enough space to do that. Instead, it focused on the **specific aspect** of the image that is **important in the current context**. In other words, the appropriate or "correct" alt text is a property of the **image placement**, not the image itself. There are only some trivial exceptions to this, like logos, certifications and images of text (which you shouldn't be doing, anyway). You can learn more about this idea in this [HTTP 203 episode (_Writing Good Alt Text_) on YouTube](https://youtu.be/flf2vS0IoRs).

The idea behind a central media library (asset volume in Craft) is that you can reuse assets in multiple places without having to repeat the same meta data. Developers know this as the [DRY principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). But this idea breaks down as soon as an author actually wants to use the same image in two different contexts and realizes that they need two different alt texts.

To properly support this idea, the field for the alt text needs to be added not to the asset, but to every page where an image is _placed_. In practice, this means you need a custom `alt` text field next to every asset field where you select an image. This will allow the author to reuse an image, but write different alt texts depending on the current context. Unfortunately, this setup has some downsides:

- The author experience is worse. Having an alt text field next to every asset field complicates the field layout and increased mental load. And it's not in line with author expectations, as having the alt text in the media library is such a common setup.
- You can never use an asset field to select multiple images, because then you have no way to associate one alt text with every. For something like an image gallery, you need an additional level of abstraction. For example, you can use a matrix field with two fields for a single image asset and its alt text.
- You lose the aforementioned benefit of authoring tool accessibility, because Craft CMS once again can't output an `alt` attribute for images without the `alt` property being used.

### Does this actually matter?

Those downsides are pretty severe, so it's worth asking if the debate over the the appropriate placement of the alt text field actually matters. How often do your authors actually reuse images? How often is the same images used in radically different contexts or to support wildly different statements? An image may not have a single "correct" alt text as a universal property, but authors usually have a specific intention for an image they upload. So maybe this is just an academic debate with no real-world applicability?

I think the answer depends on the scale of the project, and the intended longevity of the content in it. In a small or medium-sized project, you can probably safely put the alt text field in your asset field layouts to improve the author experience. For the rare case where the same image is used in two different contexts and requires multiple alt texts, an author can just upload the same image twice as a workaround.

### Why not both?

For large-scale projects, you might want both:

- If many authors are involved, and/or authors are regularly added or removed, authoring tool accesibility is very important, because some of those authors might depend on it.
- If you're building a project with a media library that's built to last, there's no way to know in which context an image may be used in the future. So having a one-size-fits-all alt field on the image is suddenly not a very appealing solution.

In those situations, I would argue that you should do both. Add the `alt` property to your asset volume, and instruct your authors to enter a generic alt text for that image (independent of a specific context). This alt text will be very useful for authoring tool accessibility. But then _also_ add a custom alterative text field next to your asset fields. This can either be required or optional. If it's optional, the native alt property can be used as a somewhat useful fallback.

[] Add link on `required` to the appropriate section
[] Add caveat for trivial cases (logos, images of text)
[] Add example image with multiple candidate alt texts

## Should the alt text be a required field?

Writing good alt texts that represent the purpose of the image in a given context is a lot of work. And because authors usually can't _see_ the alt text, authors tend to not put as much thought and effort into alt texts as the rest of the content on the page. If writing an alt text is not enforced by the CMS, authors will often leave it empty. It's especially easy to forgot to add alt texts if the field is only visible after double-clicking on an asset to edit its properties.

You can enforce alt texts being present by setting the alt text field to be required. You can also use the option to _Validate related assets_ on asset fields in combination with setting the field to required. This will ensure that authors can only save an element if all the assets related to it have their alt text filled out.

The downside of that approach is that some images don't require an alt text. In particular, this applies to decorative images. Those can get an empty alt attribute (`alt=""`), which causes the image to be left out of the accessibility tree, so screenreaders skip it entirely. If the alt text field is optional, you can treat images with an empty alt text as decorative and output an empty `alt` attribute. However, there's no way to tell whether the alt text field has been left empty _intentionally_ or _accidentally_. So you might end up with a lot of inaccessible images that really _should_ have an alt text. This could be solved by adding a second lightswitch field that marks an image as decorative, which is toggled off by default. Then you can use field conditions to hide the alt field if the lightswitch is toggled on. Required fields are not validated if they are hidden, so this will validate successfullly. This way, you force authors to make an active decision – either write an alt text or explicitly mark the image as decorative.

Whatever you do, you can't force authors to write _good_ alternative texts for your images. If you simply set a field to required, which enforces alt texts on a technical level, but don't give authors any instructions or guidance on how to write good alt texts, you will end up with a lot of bad alt texts. Only a single word, the same generic text copy-and-pasted to a bunch images, antipatterns like prefixing every text with _Image of …_ and so on. A requirement for alt texts that's _enforced on a technical level_ should always be also enshrined on an _organization level_. For example, by providing training on why alt texts are important and how to write them well.

Or maybe you can just generate them with AI?

## Can AI generate my alt texts?

Since writing good alt texts is a lot of work, same as writing any other copy, maybe AI can help you there?

I think it depends a lot on how an AI tool to generate alternative texts is integrated into the system or your workflow. One approach that definitely does _not_ work is a tool that just takes the image as input and returns an alt text as output. As discussed above, a good alt-text is context-dependent. So in order to do a good job, the AI-assistant needs to have access to that context. This can include:

- The filename
- The asset's title other fields (like a caption)
- The names of the people and places pictured in the image
- The surrounding content of the page where the image is placed

In addition, generative AI should only by used to assist authors with writing alt texts, not replace them. Don't buy into any offering that promises to generate alt texts automatically behind the scenes, without the author having to check or refine them. This will result in a lot of incorrect, unusable alt texts.

Ideally, an AI-assistent for alt texts should offer **multiple suggestions** for the author to choose from and **refine as necessary**. The context should be passed to the assistant automatically, as far as possible. Authors should also get an input field to write additional context for the prompt that's passed to the AI.

## Conclusion

[] Write conclusion
