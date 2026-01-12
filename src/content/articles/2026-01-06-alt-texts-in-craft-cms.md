---
title: 'The best way to set up alt texts in Craft CMS'
description: 'This is a guide on the various ways to configure alternative texts in Craft CMS. How can we set up authors to create and maintain high quality, accessible alt texts? Does the field belong with the image, or with the context in which the image is used? Can you just generate everything with AI? If you think you’re done after adding a text field, this article is for you.'
seo_description: 'Everything you need to know about configuring alternative texts for images in Craft CMS for optimal accessibility and author experience.'
---

**As Craft CMS gives you full control over content modelling, there are several ways to set up alternative text fields for images. This article is an in-depth exploration of the different options you have to design the author interfaces for alt texts, and what you as a developer can do to ensure that the site stays accessible.**

This post is **not** intended as a general tutorial on using alt texts, and also not a guide on writing good alt texts. It’s specifically for developers who want to optimize the authoring experience and accessibility of alt texts in Craft CMS.

## Creating an alt field for assets

Craft CMS comes with the ability to edit the field layout for your asset volumes. You can provide fields for metadata (like an alt text) that is directly associated with an uploaded asset, which can then be reused on multiple pages. This gives you more control over content modelling compared to _some_ other CMS, which come with a media library with a default set of fields that you can’t easily change.

Craft 4 introduced the [native `alt` property for assets](https://craftcms.com/blog/craft-4). Prior to this, you could only create a custom field. The huge advantage of the native property is that Craft _knows_ that its value is an alt text for the given asset. This is important for [authoring tool accessibility](https://www.w3.org/WAI/standards-guidelines/atag/), i.e. the accessibility of the Control Panel itself. If the native property is used, Craft can use it as the `alt` attribute for the `<img>` tag in the Control Panel wherever a thumbnail of the asset is displayed. You can use field conditions to only show the alt field for assets of [kind `image`](https://craftcms.com/docs/5.x/reference/element-types/assets.html#kind).

One downside of the native `alt` property in Craft 4 was that it **wasn’t translatable**. This means the native property was not a viable option for multilingual sites, since you definitely want to be able to translate your alt texts. This was [fixed in Craft 5](https://github.com/craftcms/cms/pull/12525).

In Craft 5 and above, using the native property is advisable, especially if authoring tool accessibility is important to you. To summarize:

- In Craft 3 and below, you can only use a custom field.
- In Craft 4, use the native property unless you need translatable alt fields.
- In Craft 5, always use the native property.

## Does the alt text field belong with the image?

Having the alt text as a field on the asset itself makes sense at first glance. Many CMS — [like WordPress](https://wordpress.com/support/edit-media-library/#change-file-title-caption-alt-text-and-description) — do this by default, so authors are already used to it. It’s easy for developers to set up and handle in code.

But is this practice actually _correct_?

Having the alternative text field in the asset field layout assumes that a good alternative text is an **inherent property of the image**. This implies that there is an objectively correct alt text for every image, which is appropriate everywhere the image is used. This assumption is, unfortunately, wrong. A good alt text depends on the **context of where the image is placed**. An alt text never describes the entire image, there’s simply not enough space to do that. Instead, it focuses on the specific meaning of the image that is important in the context of the current page. In other words, the appropriate or "correct" alt text is a **property of the image placement**, not the image itself. There are only some trivial exceptions to this, like logos or images of text (which you shouldn’t be doing, anyway). You can learn more about this idea in this [HTTP 203 episode (_Writing Good Alt Text_) on YouTube](https://youtu.be/flf2vS0IoRs).

<aside>

A counterexample would be a website providing stock images. For the stock images, a completely generic description of an image might be the perfect alt text to use, because the images are always presented devoid of context.

</aside>

The idea behind a central media library (_asset volume_ in Craft) is that you can reuse assets in multiple places without having to repeat the same meta data. Developers know this as the [DRY principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). But this idea breaks down as soon as an author actually wants to use the same image in two different contexts and realizes that they need two different alt texts.

To properly support this idea, the field for the alt text needs to be added not to the asset, but to every page where an image is _placed_. In practice, this means you need a custom text field next to every asset field where you select an image. This will allow the author to reuse an image, but write different alt texts depending on the current context. Unfortunately, this setup has some downsides:

- The author experience is worse. Having an alt text field next to every asset field complicates the field layout and increases mental load. And it’s not in line with author expectations, as having the alt text in the media library is such a common setup.
- You can never use an asset field to select _multiple_ images, because then you have no way to associate an alt text with each selected image. For something like an image gallery, you need an additional level of abstraction. Like a matrix field with two fields for a _single_ image asset and its alt text.
- You lose the aforementioned benefit of authoring tool accessibility, because Craft CMS once again can’t output an `alt` attribute for images without the `alt` property being used.

### Does this actually matter?

Those downsides are pretty severe, so it’s worth asking if the debate over the appropriate placement of the alt text field actually matters. How often do your authors actually reuse images? How often is the same image used in radically different contexts or to support wildly different statements? An image may not have a single “correct” alt text as a universal property, but authors usually have a specific intention for an image they upload. So maybe this is just an academic debate with no real-world applicability?

I think the answer depends on the scale of the project, and the intended longevity of the content in it. In a small or medium-sized project, you can probably safely put the alt text field in your asset field layouts to improve the author experience. For the rare case where the same image is used in two different contexts and requires multiple alt texts, an author can just upload the same image twice as a workaround.

### Why not both?

For large-scale projects, you might want both:

- If many authors are involved, or new authors are regularly added and removed, authoring tool accessibility is very important, because some of those authors might depend on it.
- If you’re building a project with a media library that’s built to last, there’s no way to know in which context an image may be used in the future. So having a one-size-fits-all alt field on the image is suddenly not a very appealing solution.

In those situations, I would argue that you should do both. Add the `alt` property to your asset volume, and instruct your authors to enter a generic alt text for that image (independent of a specific context). This alt text will be very useful for authoring tool accessibility. But then _also_ add a custom alternative text field next to your asset fields. This can either be [required or optional](#should-the-alt-text-be-a-required-field). If it’s optional, the native alt property can be used as a somewhat useful fallback.

## Should the alt text be a required field?

Writing good alt texts that represent the purpose of the image in a given context is a lot of work. And because authors usually don’t _see_ the alt text on the page, they tend not to put as much thought and effort into alt texts as the rest of the content. If providing an alt text is not enforced by the CMS, authors will often leave it empty. It’s especially easy to forget to add alt texts if the field is only visible after double clicking on an asset to edit its properties.

You can enforce alt texts being present by setting the alt text field to be required. You can also use the option to _Validate related assets_ on asset fields in combination with setting the field to required. This will ensure that authors can only save an element if all the assets related to it have their alt text filled out.

The downside of that approach is that some images placed on a page _don’t actually need an alt text_. In particular, this applies to decorative images. Those can get an empty alt attribute (`alt=""`), which causes the image to be left out of the accessibility tree, so screen readers skip it entirely. If the alt text field is optional, you can treat images with an empty alt text as decorative in your templates.

However, there’s no way to tell whether the alt text field has been left empty _intentionally_ or _accidentally_. So you might end up with a lot of inaccessible images that really _should_ have an alt text. One solution for this is to expose the decision that an image is decorative to authors. For example, you can add a lightswitch field that marks an image as decorative, which is toggled off by default. Then you can use field conditions to hide the alt field if the lightswitch is toggled on. Required fields are not validated if they are hidden, so this will validate successfully. This way, you force authors to make an active decision – either write an alt text or explicitly mark the image as decorative.

Whatever you do, you can’t force authors to write _good_ alternative texts for your images. If you simply set a field to required, but don’t give authors any instructions or guidance on how to write good alt texts, you will end up with a lot of bad ones. A requirement for alt texts that’s _enforced on a technical level_ should always be accompanied by an _emphasis on accessibility on an organization level_. For example, by training authors on why alt texts are important and how to write them, or by performing regular accessibility audits.

Or maybe you can just generate them with AI?

## Can AI generate my alt texts?

Since writing good alt texts is a lot of work, just as writing any other copy, maybe AI can help you there?

I think it depends a lot on how an AI tool to generate alternative texts is integrated into the system and into your workflows. One approach that definitely does _not_ work is a tool that just takes the image as input and returns an alt text as output. As discussed above, a good alt text is context-dependent. So in order to do a good job, the AI tool needs to have access to that context. This can include:

- The filename
- The asset’s title and other fields (like a caption)
- The names of the people and places pictured in the image
- The surrounding content of the page where the image is placed

In addition, generative AI should only be used to assist authors with writing alt texts, not replace them. Don’t buy into any offering that promises to generate alt texts automatically behind the scenes, without the author having to check or refine them. This will result in a lot of incorrect, unusable alt texts.

Ideally, an AI assistant for alt texts should offer **multiple suggestions** for the author to choose from and **refine as necessary**. The context should be passed to the assistant automatically, as far as possible. Authors should also get an input field to write additional context for the prompt that’s passed to the AI. Finally, the AI should also have the option to suggest that an image is purely decorative in the context of its placement and [should not have an alt text](#should-the-alt-text-be-a-required-field).

I would not use any tool or plugin that just generates alt texts for every uploaded image, without making this visible to users or taking the context of the image into account.

## Conclusion

There is no single perfect way to set up alt texts in Craft CMS that works for every project. It depends on the scope of the project, the organizational structure, and most importantly, the people that will actually work with the system you create for them. Your decisions, like where to place the alt text field, whether to make it required or not, and what other supplementary options you provide, will shape the author experience. You can either make it an easily-forgotten chore or a straightforward task that’s quickly integrated into the author’s workflows. Just as alt texts are context-dependent, so are the decisions on how to implement them in Craft. AI can help, but as always, it isn’t a one-size-fits-all solution or a replacement for human oversight.
