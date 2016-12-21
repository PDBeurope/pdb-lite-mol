# PDB LiteMol

[![NPM version](http://img.shields.io/npm/v/pdb-lite-mol.svg)](https://www.npmjs.org/package/pdb-lite-mol) 

This is an AngularJs Web-Component for LiteMol 3D structure viewer. LiteMol is a streamlined structure viewer which enables a PDB structure to be explored within a browser rather than requiring pre-installed molecular graphics software. There is also the option to view electron density of the structure where structure factors have been deposited to the PDB. Litemol also displays validation and domain information for the structure. 
It is a <a href="http://www.ebi.ac.uk/pdbe/pdb-component-library" target="_blank">PDB Component Library</a> component.

If you are interested in using core LiteMol library or if you want to customize / extend the functionality, you can refer to <a href="https://github.com/dsehnal/LiteMol" target="_blank">LiteMol repository</a> for more information.

![PDB LiteMol](/assets/pdb-litemol.png)

## Getting Started
It takes only 3 easy steps to get started with PDB Components.

* Include module files and required dependencies
* Install the component
* Use component as custom element anywhere in the page

>*If you have installed the <a href="http://www.ebi.ac.uk/pdbe/pdb-component-library" target="_blank">PDB Component Library</a> in your application then you can directly start using the component as custom element (refer step 3).*

#### **1.** Include module files and dependencies
Download the module javascript file (pdb.litemol.min.js and pdb.litemol.min.css) stored in the 'build' folder. Include the files in your page &lt;head&gt; section.

You'll also need to include the AngularJS library file (please refer *'bower.json'* file for complete dependency details).
```html
<!-- minified component css -->
<link rel="stylesheet" type="text/css" href="build/pdb.litemol.min.css">

<!-- Dependencey scripts (these can be skipped if already included in page) -->
<script src="bower_components/angular/angular.min.js"></script>

<!-- minified component js -->
<script src="build/pdb.litemol.min.js"></script>
```

#### **2.** Installation
As soon as you've got the dependencies and library files included in your application page you just need to include following installation script :

***I)*** If you are developing an AngularJs Application

```html
<script>
angular.module('myModule', ['pdb.litemol']);
</script>
```

***II)*** For other Applications

```html
<script>
(function () {
  'use strict';
  angular.element(document).ready(function () {
      angular.bootstrap(document, ['pdb.litemol']);
  });
}());
</script>
```

#### **3.** Using component as custom element anywhere in the page

The component can be used as custom element, attribute or class anywhere in the page.

```html
<!-- component as custom element -->
<pdb-lite-mol pdb-id="'1cbs'"></pdb-lite-mol>

<!-- component as attribute -->
<div pdb-lite-mol pdb-id="'1cbs'"></div>

<!-- component as class -->
<div class="pdb-lite-mol" pdb-id="'1cbs'"></div>

```
## Documentation

### Attributes
| Sr. No.        | Attribute           | Values  | Description |
|:-------------:|:-------------|:-----|:-----|
| 1      | pdb-id | _PDB ID_ <br>**Mandatory attribute!**  | Example : pdb-id='1cbs' |
| 2      | load-ed-maps | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Load Electron Density Maps if value is set to true<br>Example : load-ed-maps="true"  |
| 3      | hide-controls | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Hide controls menu if value is set to true<br>Example : hide-controls="true"  |
| 4      | custom-query | refer: <a href="http://www.ebi.ac.uk/pdbe/coordinates/" target="_blank">Coordinate Server</a> |load specific part of the structure<br>Example : custom-query="ligandInteraction?name=REA&radius=4"  |
| 5      | show-logs | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'true' |Display logs panel  |
| 6      | tree-menu | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Display Menu in Tree/CCP4 format  |
| 7      | is-expanded | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Display full screen |
| 8      | validation-annotation | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Load Validation Report Annotation (works only when tree-menu='false') |
| 9      | domain-annotation | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Load Domain Annotation (works only when tree-menu='false') |
| 10      | source-url | Absolute url to downlaod structure data (Optional attribute) |load specific data from a given url. Note - you have to add 'source-format' attribute to load data using this option.<br>Example: source-url="http://ftp.ebi.ac.uk/pub/databases/msd/pdbechem/files/sdf/ATP.sdf" |
| 11      | source-format | _String_ <br>*supported format : mmcif, bcif (binarycif) , pdb, sdf - (Optional attribute) * <br>Default : 'mmcif' |This attribute is <strong>mandatory</strong> to load data using 'source-url' attribute. Example: source-format="sdf" |
| 12     | display-full-map-onload | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'false' |Display full density map onload |
| 13     | subscribe-events | _Boolean (true/false)_ <br>*(Optional Attribute)* <br>Default : 'true' |Subscribe to other PDB Components custom events. |

### Helper functions
Use this to programatically control the component. Check out the examples (litemol-customize-demo.html) to see how the helper function can be used.

| Sr. No.        | Function | Description |
|:-------------:|:-------------|:-----|
| 1 | hideControls()| Use : hide control panel.<br>Parameter : none |
| 2 | showControls()| Use : show control panel.<br>Parameter : none |
| 3 | expand()| Use : switch to full-screen mode.<br>Parameter : none |
| 4 | setBackground()| Use : set background colour to white.<br>Parameter : none |
| 5 | loadDensity(isWireframe)| Use : programatically load density.<br>Parameter : 1. isWireframe (type : boolean) (value : true / false)<br>if set to..<br>true : shows density as wire-frame.<br>false: shows density as surface. |
| 6 | toggleDensity()| Use : programatically toggle density.<br>Parameter : none |
| 7 | colorChains( chainId, colorArr )| Use : set chain colour and greys out remaining residues colour.<br>Parameter : <br>1. chainId (type : string)<br>2. colorArr (type : array) (value : RGB value - example : [255,0,0] for red) |
| 8 | SelectExtractFocus(selectionDetails, colorCode, showSideChains)| Use : Colour and focus desired range of residues in the structure.<br>Parameter : <br>1. selectionDetails (type : object)<br>Example :<br>{<br>&nbsp;&nbsp;&nbsp;&nbsp;entity_id : '1',<br>&nbsp;&nbsp;&nbsp;&nbsp;struct_asym_id : 'A',<br>&nbsp;&nbsp;&nbsp;&nbsp;start_residue_number : 10,<br>&nbsp;&nbsp;&nbsp;&nbsp;end_residue_number : 15<br>}<br>2. colorCode (type : object) (value : RGB value - example : {r:255, g:0, b:0} for red)<br>3. showSideChains (type : boolean) (value : true / false) (optional)<br>if set to..<br>true : shows sidechain residues for the selected range. |
| 9 | highlightOn(selectionDetails)| Use : highlight desired range of residues in the structure.<br>Similar to SelectExtractFocus() except it do not allow colour setting and focus.<br>Parameter : <br>1. selectionDetails (type : object)<br>Example :<br>{<br>&nbsp;&nbsp;&nbsp;&nbsp;entity_id : '1',<br>&nbsp;&nbsp;&nbsp;&nbsp;struct_asym_id : 'A',<br>&nbsp;&nbsp;&nbsp;&nbsp;start_residue_number : 10,<br>&nbsp;&nbsp;&nbsp;&nbsp;end_residue_number : 15<br>} |
| 10 | highlightOff()| Use :Removes highlight set using highlightOn()<br>Parameter : none |
| 11 | resetThemeSelHighlight()| Use : Reset any selection and highlight to default.<br>Parameter : none |

### Custom Events
Use this to subscript/bind events of this component. Event data (available in key = 'eventData') contains information about the residue number, chain, entry and entity, etc.

| Sr. No.        | Event | Description |
|:-------------:|:-------------|:-----|
| 1 | PDB.litemol.click | Use this to bind to the click event of this component elements. Event data (available in key = 'eventData') contains information structure residue clicked<br> Example:<br> document.addEventListener('PDB.litemol.click', function(e){ /\/do something on event }) |
| 2 | PDB.litemol.mouseover | Use this to bind to the mouseover event of this component elements.<br> Example:<br> document.addEventListener('PDB.seqViewer.mouseover', function(e){ /\/do something on event }) |
| 3 | PDB.litemol.mouseout | Use this to bind to the mouseout event of this component elements.<br> Example:<br> document.addEventListener('PDB.seqViewer.mouseout', function(e){ /\/do something on event }) |

*Please refer <a href="http://www.ebi.ac.uk/pdbe/pdb-component-library/doc.html#a_litemol" target="_blank">this link</a> for more documentation, demo and parameters details.*

## Contact
Please <a href="https://github.com/mandarsd/pdb-lite-mol">use github</a> to report **bugs**, discuss potential **new features** or **ask questions** in general. Also you can <a href="http://www.ebi.ac.uk/pdbe/about/contact" target="_blank">contact us here</a> for support, feedback or to report any issues.

## License
The plugin is released under the Apache License Version 2.0. You can find out more about it at http://www.apache.org/licenses/LICENSE-2.0 or within the license file of the repository.

## If you are interested in this plugin...
...you might also want to have a look at the <a href="http://www.ebi.ac.uk/pdbe/pdb-component-library" target="_blank">PDB Component Library</a>.


