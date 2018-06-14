---
author:
- Johannes Goslar
bibliography:
- '\\jobname.bib'
title: Reflectance Transformation Imaging Proposal
---

\maketitle
Background
==========

Cultural Heritage Imaging describes Reflectance Transformation Imaging
as following[@CHIRTI]:

> RTI is a computational photographic method that captures a subject's
> surface shape and color and enables the interactive re-lighting of the
> subject from any direction. RTI also permits the mathematical
> enhancement of the subject's surface shape and color attributes. The
> enhancement functions of RTI reveal surface information that is not
> disclosed under direct empirical examination of the physical object.

To generate the initial data the to-be-analysed object is placed under a
specially crafted dome, which inner hull is sprayed matte black and has
single controllable lightsources spread out. The top of the dome has an
hole in which a camera objective fits. Each lightsource is lighted in
order and a picture is taken with only that lightsource shining. These
images are then transferred to a computer, where a first program
analyses this raw data and repackages it for later use in RTI viewers.
Within these RTI viewers the user can manipulate the lightning to reveal
previously hidden information. The University of Oxford is an hub for
RTI research, but the main interest was so far from the Faculty of
Classics and the School of Archaeology, which use RTI processes to
analyse archaeological artifacts.[@earl2011reflectance] Of particular
note is the current effort to further uncover the meaning of the so
called 'Bloomberg tablets', which are the remains of 405 Roman wax
tablets, dating from 50 AD to 80 AD. Only the wood remains of these
tablets, but scratches in the wood relate to the once written text A
further complication is the occurred reuse of these tablets, multiple
texts can overlap each other.[@bloomberg] RTI can help reveal the
information by replacing and automating two human eyes and a light torch
by the means discussed above. The thesis will aim to integrate the
Department of Computer Science with the ongoing research and finally
provide the other stakeholders with better software to achieve their
goals.

Open Questions
==============

The open questions range from questions specific to the Oxford RTI setup
to general applicable questions:

-   How can the Oxford RTI setup be further automated? Currently objects
    are placed by hand, the images are transferred by hand, manual
    preprocessing steps are required, disk space is constrained, etc.

-   Do precalculated lightning angles improve the resulting images?
    Currently a glossy billiard ball is placed alongside the analysed
    object and the lightning angle is calculated from the specular
    reflection on this ball. Given automated object placement and
    centering, the actual angles could be measured inside the
    (custom-build, one-of) dome and then used instead.

-   Can RTI be an interesting part of the 'Physically Based Rendering'
    course? The course features some slides already, but a practical
    could further help the understanding. A practical element would work
    best with an extensible RTI core, for which new modules could be
    written each term the course is hold.

-   Can modern software engineering and modern user experience design
    help the researchers uncover information faster? Most RTI software
    has limited support for different operating systems, supported RTI
    domes, image input formats and is generally specific to the
    circumstances the author was in. None is featuring an extensible,
    modular design, which others could write plugins for.

-   Can integrated collaboration features support the inquires? All
    current RTI software only supports a single-user process. No
    settings can be shared live, no annotations are synchronized
    automatically, no connectivity is provided. An online/cloud based
    background service integrated into the RTI viewer could potentially
    implement this feature set.

-   Can machine learning be used to automatically extract hidden textual
    information from RTI images? Building on the proposed annotation
    feature to create labeled data, could machine learning principles be
    used on regions of the raw RTI image to automatically run through
    different lightning configurations and reveal the previously hidden
    letters?

Proposed Method
===============

The common denominator of all questions above is the need to have an
extendable RTI base, which should provide hooks and plugin options for
more specific use cases. As no RTI base is available, this thesis will
develop this basis and an initial set of plugins. Preliminary
discussions ended with the likely technology stack of:

-   Use of web technologies (ECMAScript, HTML, CSS), so the viewing
    component can be used from any web browser and the analysis
    component can be run locally inside an 'electron' shell to have fast
    access to the raw data (up to 6GB for one object)

-   Use of TypeScript as main implementation language, as it allows a
    typeable API for plugins, which plain ECMAScript would not allow

Based on this core the next step will be to achieve parity with the
current RTI analyser and viewer, for which the Oxford Centre for the
Study of Ancient Documents will provide raw datasets and the currently
calculated RTI images. After parity is reached the focus will switch to
the implementation of the plugins proposed above. The given timeframe
will unlikely be sufficient for a comprehensive addition of the machine
learning component, as enough labeled data is unlikely to suddenly
available, and likely will have to be done in further research. The
final step will be an user study with the Oxford RTI hub to evaluate if
the implemented plugins helped uncovering more information faster, the
fixing of revealed bugs in the evaluation and the best possible
accommodation of occurring wishes from the end users.

Draft Timetable
===============

The thesis has to finished by end of August, which gives a timeframe of
18 weeks, including 1.5 weeks for sickness and 1.5 for other hiccups,
leaves 15 weeks, which will be split up accordingly:

1 - 3

:   Collection of requirements of all stakeholders, evaluation of
    reusable code from the current viewers, completion of the
    introduction part of the thesis and architecture of the base

4 - 6

:   Implementation of the new RTI program base, documentation inside the
    thesis, completion of the rollout and distribution pipelines.

  7   

:   First rollout to Oxford-based users and first user feedback cycle to
    identify potential problems early.

8 - 11

:   Implementation of the proposed plugins and writing of their
    documentation. Completion of the technical part of the thesis.

12 - 13

:   Feature freeze, second rollout and public release, followed by the
    user study and evaluation.

14 - 15

:   Future outlook, final additions and proof reading of the thesis.

Signatures
==========

\vspace{4em}
\printbibliography
