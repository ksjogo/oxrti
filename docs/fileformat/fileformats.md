BTF File Format
===============

This section describes the BTF file format. The aim of this file format is to provide a generic container for <abbr title="Bidirectional Texture Function">BTF</abbr> data to be specified using a variety of common formats.  


File Structure
--------------

A BTF file is a ZIP file containing the following:
	* A **manifest** file in XML format, named `manifest.xml`. The manifest contains all information about the <abbr title="Bidirectional Reflectance Distribution Function">BRDF</abbr>/<abbr title="Bidirectional Scattering Distribution Function">BSDF</abbr> model being used, including the names for the available **channels** (e.g. `R`, `G` and `B` for the 3-channel RGB), the names of the necessary **coefficients** (e.g. bi-quadratic coefficients) and the **image file format** for each channel.
	* A single folder named `data`, with sub-folders having names in 1-to-1 correspondence with the channels specified in the manifest.
	* Within each channel folder, greyscale image files having names in 1-to-1 correspondence with the coefficients specified in the manifest, each in the image file format specified in the manifest for the corresponding channel.
For example, if one is working with RGB format (3-channels named `R`, `G` and `B`)  in the PTM model (five coefficients `a2`, `b2`, `a1`, `b1` and `c`, specifying a bi-quadratic) using 16-bit greyscale bitmaps, the file `/data/B/a2.bmp` is the texture encoding the `a2` coefficient for the blue channel of each point in texture space. 


Manifest
--------

The manifest for the BTF file format is an XML file with root element `root`. The `root` element has a mandatory child element tagged `data`, with the option of additional child elements (with different tags) left open to future extensions of the format. 
	* The `data` element has an arbitrary number of child elements, all tagged `channel`. The `data` element has three attributes, named `width`, `height` and `channel-model`. The `width` and `height` attributes have values in the positive integers describing the dimensions of the BTDF. The `channel-model` attribute has value a non-empty alphanumeric string uniquely identifying the BRDF/BSDF colour model used by the BTF file (see [Options](#Options) section below).
	* Each `channel` element has an arbitrary number of child elements, all tagged `coefficient`, as well as two attributes, `name` and `coefficient-model`. The `name` attribute has value a non-empty alphanumeric string no longer than 255 characters and unique amongst the `channel` elements. The `coefficient-model` attribute has value a non-empty alphanumeric string uniquely identifying the BRDF/BSDF approximation model used by the BTF file (see [Options](#Options) section below).
	* Each `coefficient` element has two attributes, `name` and `format`. The `name` attribute has value a non-empty alphanumeric string no longer than 255 characters and unique among the `coefficient` child children of a given `channel` element. The `format` attribute has value a non-empty alphanumeric string uniquely identifying the image file format used to store the channel values (see [Options](#Options) section below). The `coefficient` elements have no child elements nor content.

Textures
--------

Each image file `/data/CHAN/COEFF.EXT` has the same dimensions specified by the `width` and `height` attributes of the `data` element in the manifest, and is encoded in the greyscale image file format specified by the `format` attribute of the unique `coefficient` element with attribute `name` taking the value `COEFF` (the extension `.EXT` is ignored). The colour value of a pixel `(u,v)` in the image is the value for coefficient `COEFF` of channel `CHAN` in the BRDF/BSDF for point `(u,v)`, according to the model jointly specified by the values of the attribute `model` for element `channels` (colour model) and the attribute `model` for element `coefficients` (approximation model). 


Options
-------

At present, the following values are defined for attribute `channel-model` of element `channels`.
	* `RGB`: the 3-channel RGB colour model, with channels named `R`, `G` and `B`. This colour model is currently under implementation.
	* `LRGB`: the 4-channel LRGB colour model, with channels named `L`, `R`, `G` and `B`. This colour model is currently under implementation.
	* `SPECTRAL`: the spectral radiance model, with an arbitrary non-zero number of channels named either all by wavelength (format `---nm`, with `---` an arbitrary non-zero number) or all by frequency format `---Hz`, with `---` an arbitrary non-zero number. This colour model is planned for future implementation.

At present, the following values are defined for attribute `model` of element coefficients, where the ending character `*` is to be replaced by an arbitrary number greater than or equal to 1.
	* `flat`: flat approximation model (no dependence on light position). This approximation model is currently under implementation.
	* `RTIpoly*`: order-`*` polynomial approximation model for <abbr title="Reflectance Transformation Imaging">RTI</abbr> (single view-point BRDF). This approximation model is currently under implementation.
	* `RTIharmonic*`: order-`*` hemispherical harmonic approximation model for <abbr title="Reflectance Transformation Imaging">RTI</abbr> (single view-point BRDF). This approximation model is currently under implementation.
	* `BRDFpoly*`: order-`*` polynomial approximation model for BRDFs. This approximation model is planned for future implementation.
	* `BRDFharmonic*`: order-`*` hemispherical harmonic approximation model BRDFs. This approximation model is planned for future implementation.
	* `BSDFpoly*`: order-`*` polynomial approximation model for BSDFs. This approximation model is planned for future implementation.
	* `BSDFharmonic*`: order-`*` spherical harmonic approximation model for BSDFs. This approximation model is planned for future implementation.

At present, the following values are defined for attribute `format` of elements tagged `coefficient`,  where the ending character `*` is the bit-depth, to be replaced by an allowed positive multiple of 8.
	* `BMP*`: greyscale BMP file format with the specified bit-depth (8, 16, 24 or 32). Support for this format is currently under implementation.
	* `PNG*`: PNG file format encoding the specified bit-depth (8, 16, 24, 32, 48 or 64). Support for this format is currently under implementation. Different PNG colour options are used to support different bit-depths:
		* `Grayscale` with 8-bit/channel to encode 8-bit bit-depth.
		* `Grayscale` with 16-bit/channel to encode 16-bit bit-depth.
		* `Truecolor` with 8-bit/channel to encode 24-bit bit-depth.
		* `Truecolor and alpha` with 8-bit/channel to encode 32-bit bit-depth.
		* `Truecolor` with 16-bit/channel to encode 48-bit bit-depth.
		* `Truecolor and alpha` with 16-bit/channel to encode 64-bit bit-depth.
