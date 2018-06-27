
Proposal for a modular RTI software package
---
Reflectance Transformation Imaging can be used to reveal previously hidden information in (archaeological) artifacts, using a multi-step process:

* Capturing the object from the same perspective but with varying known light sources
* Using these images to calculate the reflectance information for each pixel
* (Interactive) light placements and viewpoint changes to uncover the information

This master thesis project will focus on the later two. A variety of RTI software exists currently, but most of them are neither having good performance, being maintained, allowing collaboration or able to run on a variety of different setups.
The goal of this thesis thus is to provide an extensible architecture for a modular RTI software package with the following technological base:

* HTML/CSS for interfaces
* WebGL for RTI calculation and rendering
* TypeScript/JavaScript for programming
* public website RTI viewing 
* standalone (Electron) app for offline use and RTI calculation
* open source licensed (GPLv3+)
* automated tests 

The inital set of modules will consist of:

* RTI calculation
  * Specific implementation for the Centre for the Study of Ancient Documents RTI domes
* Rendering 
  * Light sources and their movement
  * Default rendering + specular enhancment
* Annotation module
  * Text annotations
  * Region markers
  * Painting layers
  
Following modules will be added if time permits:

* Cloud Integration
  * Cloud storage of rti images
  * Dynamic session sharing 
  * Persistent online annotations

...

Future:

* Machine Learning Module
  * Using annotated regions to train OCR 
  * Automated optimization of lightning angles and object parameters
  
