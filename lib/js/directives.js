; (function () {
  
  angular.module('pdb.litemol', [])
  .directive('pdbLiteMol', ['$document', function($document, $http, $q){
	return {
	  restrict: 'EAC',
	  scope: {
		pdbId : '=',
		loadEdMaps: '@',
		validationAnnotation: '@',
		domainAnnotation: '@',
		hideControls: '@',
		showLogs: '@',
		customQuery: '@',
		customRender: '@',
		treeMenu: '@',
		isExpanded: '@',
		subscribeEvents: '@',
		sourceUrl: '@',
		sourceFormat: '@',
		displayFullMapOnload: '@'
	  },
	  template: '',
	  link: function (scope, element, attrs) {
		 
		//Method to create custom events
		var createNewEvent = function(eventTypeArr){
			var eventObj = {};
			angular.forEach(eventTypeArr, function(eventType, index){
				var event; 
				if (typeof MouseEvent == 'function') {
					// current standard
					event = new MouseEvent(eventType, { 'view': window, 'bubbles': true, 'cancelable': true });
				
				} else if (typeof document.createEvent == 'function') {
					// older standard
					event = document.createEvent('MouseEvents');
					event.initEvent(eventType, true /*bubbles*/, true /*cancelable*/);
				
				} else if (typeof document.createEventObject == 'function') {
					// IE 8- 
					event = document.createEventObject();
				}
				
				eventObj[eventType] = event;
			});
			
			return eventObj;
		}
		
		//default events
		scope.pdbevents = createNewEvent(['PDB.litemol.click','PDB.litemol.mouseover','PDB.litemol.mouseout']);
		  
		//Set default scope values
		if(typeof scope.hideControls !== 'undefined' && scope.hideControls == 'true'){
			scope.hideControls = true;
		}else{
			scope.hideControls = false;
		}
		
		if(typeof scope.treeMenu !== 'undefined' && scope.treeMenu == 'true'){
			scope.treeMenu = true;
		}else{
			scope.treeMenu = false;
		}
		
		if(typeof scope.isExpanded !== 'undefined' && scope.isExpanded == 'true'){
			scope.isExpanded = true;
		}else{
			scope.isExpanded = false;
		}
		
		//Set subscribe event to true by default
		if(typeof scope.subscribeEvents == 'undefined'){
			scope.subscribeEvents = 'true';
		}
		
		//Method for inheritance support
		var __extends = (this && this.__extends) || function (d, b) {
			for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			function __() { this.constructor = d; }
			d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
		
		//Setting DataSources
		var Viewer;
		(function (Viewer) {
			var DataSources;
			(function (DataSources) {
				var Bootstrap = LiteMol.Bootstrap;
				var Entity = Bootstrap.Entity;
				DataSources.DownloadMolecule = Entity.Transformer.Molecule.downloadMoleculeSource({
					sourceId: 'url-molecule',
					name: 'URL',
					description: 'Download a molecule from the specified Url (if the host server supports cross domain requests).',
					defaultId: '//www.ebi.ac.uk/pdbe/coordinates/1tqn/cartoon',
					urlTemplate: function (id) { return id; },
					isFullUrl: true
				});
			})(DataSources = Viewer.DataSources || (Viewer.DataSources = {}));
		})(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
		
		//Setting PDBe DataSources    
		var Viewer;
		(function (Viewer) {
			var PDBe;
			(function (PDBe) {
				var Data;
				(function (Data) {
					var Bootstrap = LiteMol.Bootstrap;
					var Entity = Bootstrap.Entity;
					var Transformer = Bootstrap.Entity.Transformer;
					var Visualization = Bootstrap.Visualization;
					// straigtforward
					Data.DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({
						sourceId: 'pdbe-molecule',
						name: 'PDBe',
						description: 'Download a molecule from PDBe.',
						defaultId: '1cbs',
						specificFormat: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF,
						urlTemplate: function (id) { return ("//www.ebi.ac.uk/pdbe/static/entry/" + id.toLowerCase() + "_updated.cif"); }
					});
					Data.DownloadBinaryCIFFromCoordinateServer = Bootstrap.Tree.Transformer.action({
						id: 'molecule-download-bcif-from-coordinate-server',
						name: 'Molecule (BinaryCIF)',
						description: 'Download full or cartoon representation of a PDB entry from the CoordinateServer.',
						from: [Entity.Root],
						to: [Entity.Action],
						defaultParams: function (ctx) { return ({ id: '5iv5', type: 'Cartoon', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'http://www.ebi.ac.uk/pdbe/coordinates/' }); },
						validateParams: function (p) { return (!p.id || !p.id.trim().length) ? ['Enter Id'] : (!p.serverUrl || !p.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0; },
					}, function (context, a, t) {
						var query = t.params.type === 'Cartoon' ? 'cartoon' : 'full';
						var id = t.params.id.toLowerCase().trim();
						var url = "" + t.params.serverUrl + (t.params.serverUrl[t.params.serverUrl.length - 1] === '/' ? '' : '/') + id + "/" + query + "?encoding=bcif&lowPrecisionCoords=" + (t.params.lowPrecisionCoords ? '1' : '2');
						return Bootstrap.Tree.Transform.build()
							.add(a, Entity.Transformer.Data.Download, { url: url, type: 'Binary', id: id })
							.then(Entity.Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
							.then(Entity.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false });
					});
				})(Data = PDBe.Data || (PDBe.Data = {}));
			})(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
		})(Viewer = Viewer || (Viewer = {}));
		
		var Viewer;
		(function (Viewer) {
			var PDBe;
			(function (PDBe) {
				var Data;
				(function (Data) {
					var Bootstrap = LiteMol.Bootstrap;
					var Entity = Bootstrap.Entity;
					var Transformer = Bootstrap.Entity.Transformer;
					var Tree = Bootstrap.Tree;
					var Visualization = Bootstrap.Visualization;
					Data.DensityDownloader = Entity.create({ name: 'PDBe Density Downloader', typeClass: 'Behaviour', shortName: 'DD', description: 'Represents PDBe Density Downloader.' });
					var CreateDensityDownloader = LiteMol.Bootstrap.Tree.Transformer.create({
						id: 'pdbe-density-download-create',
						name: 'PDBe Density Downloader',
						description: 'Create the PDBe Density Downloader.',
						from: [Entity.Root],
						to: [Data.DensityDownloader],
						defaultParams: function () { return ({}); }
					}, function (context, a, t) {
						return LiteMol.Bootstrap.Task.create("Density Downloader", 'Background', function (ctx) {
							/*ctx.update('Parsing...');
							ctx.schedule(function () {
								var data = JSON.parse(a.props.data);
								var model = data[t.params.id];
								var report = Api.createReport(model || {});
								ctx.resolve(Validation.Report.create(t, { label: 'Validation Report', behaviour: new Interactivity.Behaviour(context, report), ref: 'validation-visual' }));
							});*/
							
							ctx.resolve(Data.DensityDownloader.create(t, { ref: 'densityDownloader-transformer' }));
						}).setReportTime(true);
					});
					Data.DensityDownloaderAction = LiteMol.Bootstrap.Tree.Transformer.action({
						id: 'pdbe-density-download-create-action',
						name: 'PDBe Density Downloader Action',
						description: 'PDBe Density Downloader Action',
						from: [Data.DensityDownloader],
						to: [Entity.Action],
						defaultParams: function () { return ({}); }//,
						//customController: function (ctx, t, e) { return new LiteMol.Bootstrap.Components.Transform.Controller(ctx, t, e, false); }
					}, function (context, a, t) {
						var action = LiteMol.Bootstrap.Tree.Transform.build()
							//.add(a, Transformer.Basic.CreateGroup, { label: 'Ligand Group'+fi, description: 'Ligand Group'+fi }, { ref: groupRef })
							.add(a, CreateDensityDownloader, { id: 'densityDwnldrAction' }, { isBinding: true, ref: 'densityDownloader-model' });
						return action;
					}, "Density Loader Loaded");
					Data.DensitySources = ['electron-density', 'emdb-pdbid', 'emdb-id'];
					Data.DensitySourceLabels = {
						'electron-density': 'Electron Density',
						'emdb-pdbid': 'EMDB (from PDB ID)',
						'emdb-id': 'EMDB'
					};
					function doElectron(a, t, id) {
						var action = Bootstrap.Tree.Transform.build();
						id = id.trim().toLowerCase();
						var groupRef = t.props.ref ? t.props.ref : Bootstrap.Utils.generateUUID();
						var group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: groupRef });
						var diffRef = Bootstrap.Utils.generateUUID();
						var mainRef = Bootstrap.Utils.generateUUID();
						var diff = group
							.then(Transformer.Data.Download, { url: "//www.ebi.ac.uk/pdbe/coordinates/files/" + id + "_diff.ccp4", type: 'Binary', id: id, description: 'Fo-Fc', title: 'Density' })
							.then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc', normalize: false }, { isBinding: true, ref: diffRef });
						diff
							.then(Transformer.Density.CreateVisualBehaviour, {
							id: 'Fo-Fc(-ve)',
							isoSigmaMin: -5,
							isoSigmaMax: 0,
							minRadius: 0,
							maxRadius: 10,
							radius: 5,
							showFull: typeof scope.displayFullMapOnload !== 'undefined' && scope.displayFullMapOnload == 'true' ? true : false,
							style: Visualization.Density.Style.create({
								isoValue: -3,
								isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
								color: LiteMol.Visualization.Color.fromHex(0xBB3333),
								isWireframe: t.params.isWireframe,
								transparency: { alpha: 0.75 }
							})
						}, { ref: 'density-fofc_minus' });
						diff
							.then(Transformer.Density.CreateVisualBehaviour, {
							id: 'Fo-Fc(+ve)',
							isoSigmaMin: 0,
							isoSigmaMax: 5,
							minRadius: 0,
							maxRadius: 10,
							radius: 5,
							showFull: typeof scope.displayFullMapOnload !== 'undefined' && scope.displayFullMapOnload == 'true' ? true : false,
							style: Visualization.Density.Style.create({
								isoValue: 3,
								isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
								color: LiteMol.Visualization.Color.fromHex(0x33BB33),
								isWireframe: t.params.isWireframe,
								transparency: { alpha: 0.75 }
							})
						}, { ref: 'density-fofc_plus' });
						var base = group
							.then(Transformer.Data.Download, { url: "//www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: id, description: '2Fo-Fc', title: 'Density' })
							.then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc', normalize: false }, { isBinding: true, ref: mainRef })
							.then(Transformer.Density.CreateVisualBehaviour, {
							id: '2Fo-Fc',
							isoSigmaMin: 0,
							isoSigmaMax: 2,
							minRadius: 0,
							maxRadius: 10,
							radius: 5,
							showFull: typeof scope.displayFullMapOnload !== 'undefined' && scope.displayFullMapOnload == 'true' ? true : false,
							style: Visualization.Density.Style.create({
								isoValue: 1.5,
								isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
								color: LiteMol.Visualization.Color.fromHex(0x3362B2),
								isWireframe: t.params.isWireframe,
								transparency: { alpha: 0.4 }
							})
						}, { ref: 'density-2fofc' });
						return {
							action: action,
							context: { id: id, refs: [mainRef, diffRef], groupRef: groupRef }
						};
					}
					function doEmdb(a, t, id, contourLevel, sigmaRange) {
						var action = Bootstrap.Tree.Transform.build();
						var mainRef = Bootstrap.Utils.generateUUID();
						var labelId = 'EMD-' + id;
						action
							.add(a, Transformer.Data.Download, {
							url: "//www.ebi.ac.uk/pdbe/static/files/em/maps/emd_" + id + ".map.gz",
							type: 'Binary',
							id: labelId,
							description: 'EMDB Density',
							responseCompression: Bootstrap.Utils.DataCompressionMethod.Gzip,
							title: 'Density'
						})
							.then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: labelId, normalize: false }, { isBinding: true, ref: mainRef })
							.then(Transformer.Density.CreateVisualBehaviour, {
							id: 'Density',
							isoSigmaMin: sigmaRange.minVal !== void 0 ? sigmaRange.minVal : 1.5,
							isoSigmaMax: sigmaRange.maxVal !== void 0 ? sigmaRange.maxVal : 5,
							minRadius: 0,
							maxRadius: 50,
							radius: 5,
							showFull: true, //typeof scope.displayFullMapOnload !== 'undefined' && scope.displayFullMapOnload == 'true' ? true : false,
							style: Visualization.Density.Style.create({
								isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
								isoValueType: contourLevel !== void 0 ? Bootstrap.Visualization.Density.IsoValueType.Absolute : Bootstrap.Visualization.Density.IsoValueType.Sigma,
								color: LiteMol.Visualization.Color.fromHex(0x638F8F),
								isWireframe: t.params.isWireframe,
								transparency: { alpha: 0.3 }
							})
						}, { ref: 'em-density-map' });
						return {
							action: action,
							context: { id: id, refs: [mainRef] }
						};
					}
					function fail(a, message) {
						return {
							action: Bootstrap.Tree.Transform.build()
								.add(a, Transformer.Basic.Fail, { title: 'Density', message: message }),
							context: void 0
						};
					}
					function abortMapDownlaod(a, mapSize) {
						if(scope.treeMenu == true || scope.treeMenu == 'true'){
							return {
								action: void 0,
								context: { id: 'abortMaps', refs: ['abortMapDownload'], mapSize: mapSize }
							};
						}else{
							return {
								action: Bootstrap.Tree.Transform.build()
									.add(a, Transformer.Basic.CreateGroup, { id: 'abortMapsgroup', label: 'Density Dummy Group', description: 'Density Dummy Group' }, {ref: 'abortMapDownload'}),
								context: { id: 'abortMaps', refs: ['abortMapDownload'], mapSize: mapSize }
							};	
						}
					}
					function doEmdbPdbId(ctx, a, t, id) {
						return new LiteMol.Core.Promise(function (res, rej) {
							id = id.trim().toLowerCase();
							Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/" + id, 'PDB API')
								.run(ctx)
								.then(function (s) {
								try {
									var json = JSON.parse(s);
									var emdbId = void 0;
									var e = json[id];
									if (e && e[0] && e[0].related_structures) {
										var emdb = e[0].related_structures.filter(function (s) { return s.resource === 'EMDB'; });
										if (!emdb.length) {
											res(fail(a, "No related EMDB entry found for '" + id + "'."));
											return;
										}
										emdbId = emdb[0].accession.split('-')[1];
									}
									else {
										res(fail(a, "No related EMDB entry found for '" + id + "'."));
										return;
									}
									
									if(typeof t.params.checkMapFileSize !== 'undefined' && t.params.checkMapFileSize == true){
										res(validateEMMapFileSize(ctx, a, t, emdbId, 25));
									}else{
										res(doEmdbId(ctx, a, t, emdbId));
									}
								}
								catch (e) {
									res(fail(a, 'PDB API call failed.'));
								}
							})
								.catch(function (e) { return res(fail(a, 'PDB API call failed.')); });
						});
					}
					function doEmdbId(ctx, a, t, id) {
						return new LiteMol.Core.Promise(function (res, rej) {
							id = id.trim();
							Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-" + id, 'EMDB API')
								.run(ctx)
								.then(function (s) {
								try {
									var json = JSON.parse(s);
									var contour = void 0;
									var sigmaRange = { 'minVal': void 0, 'maxVal': void 0};
									var e = json['EMD-' + id];
									if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
										contour = +e[0].map.contour_level.value;
									}
									if (e && e[0] && e[0].map && e[0].map.statistics && e[0].map.statistics.minimum !== void 0) {
										sigmaRange.minVal = +e[0].map.statistics.minimum;
									}
									if (e && e[0] && e[0].map && e[0].map.statistics && e[0].map.statistics.maximum !== void 0) {
										sigmaRange.maxVal = +e[0].map.statistics.maximum;
									}
									res(doEmdb(a, t, id, contour, sigmaRange));
								}
								catch (e) {
									res(fail(a, 'EMDB API call failed.'));
								}
							})
								.catch(function (e) { return res(fail(a, 'EMDB API call failed.')); });
						});
					}
					function getExperimentType(context) {
						var exptlMethodVal;
						//Search Parsed CIF Dictionary for Experimental Method 
						/*var cifDictionary = context.plugin.context.select('cifDict')[0];
						if(typeof cifDictionary !== 'undefined'){
							var dict = cifDictionary.props.dictionary;
							var cat = dict.dataBlocks[0].getCategory('_exptl');
							if(typeof cat !== 'undefined') var exptlMethod = cat.getColumn('method').getString(0);
						}*/
						
						try{
							var moleculeRef = context.plugin.context.select('molecule')[0];
							if(typeof moleculeRef !== 'undefined'){
								var exptlProp = moleculeRef.props.molecule.properties.experimentMethod;
								if(typeof exptlProp !== 'undefined') var exptlMethod = exptlProp;
							}
						} catch(e) {}
						
						if(typeof exptlMethod !== 'undefined' && exptlMethod == 'Electron Microscopy'){
							exptlMethodVal = 'emdb-pdbid';
						}else if(typeof exptlMethod !== 'undefined' && exptlMethod == 'X-ray diffraction'){
							exptlMethodVal = 'electron-density';
						}else{
							exptlMethodVal = exptlMethod;
						}
						
						return exptlMethodVal;
					}
					function validateEMMapFileSize(ctx, a, t, entryId, maxFileSize) {
						return new LiteMol.Core.Promise(function (res, rej) {
							$http.head("http://ftp.ebi.ac.uk/pub/databases/emdb/structures/EMD-" + entryId + "/map/emd_" + entryId + ".map.gz")
							.then(function(response) {
								var mapByteSize = response.headers('Content-Length');
								var mapMBSize =  typeof mapByteSize !== 'undefined' ? (mapByteSize / 1024) / 1024 : undefined;
								//console.log(mapMBSize+' MB');
								if(typeof mapMBSize !== 'undefined' && mapMBSize <= maxFileSize){
									res(doEmdbId(ctx, a, t, entryId));
								}else{
									res(abortMapDownlaod(a, mapMBSize));	
								}
								
							}, function(response) {
								res(fail(a, 'File size issue.'));
							});
						});
					}
					// this creates the electron density based on the spec you sent me
					Data.DownloadDensity = Bootstrap.Tree.Transformer.actionWithContext({
						id: 'pdbe-density-download-data',
						name: 'Density Data from PDBe',
						description: 'Download density data from PDBe.',
						from: [Entity.Root],
						to: [Entity.Action],
						defaultParams: function (context) {
							var exptType = getExperimentType(context);
							return ({
								sourceId: typeof exptType !== 'undefined' ? exptType : 'electron-density',
								id: {
									'electron-density': scope.pdbId,
									'emdb-id': '8003',
									'emdb-pdbid': scope.pdbId
								}
							});
						},
						validateParams: function (p) {
							var source = p.sourceId ? p.sourceId : 'electron-density';
							if (!p.id)
								return ['Enter Id'];
							var id = typeof p.id === 'string' ? p.id : p.id[source];
							return !id.trim().length ? ['Enter Id'] : void 0;
						}
					}, function (context, a, t) {
						var id;
						var exptlMethod = typeof t.params.sourceId !== 'undefined' ? t.params.sourceId : getExperimentType(context);
						if (typeof t.params.id === 'string')
							id = t.params.id;
						else
							id = t.params.id[t.params.sourceId];
						switch (exptlMethod) {
							case 'electron-density': return doElectron(a, t, id);
							case 'emdb-id': return doEmdbId(context, a, t, id);
							case 'emdb-pdbid': return doEmdbPdbId(context, a, t, id);
							default: return doElectron(a, t, id);
							//default: return fail(a, 'Unknown source.');
						}
					}, function (ctx, actionCtx) {
						if (!actionCtx)
							return;
						var _a = actionCtx, id = _a.id, refs = _a.refs, groupRef = _a.groupRef;
						if(id == "abortMaps"){
							var densityAbortMsg = 'You can download the Density using Download option in Controls';
							if(typeof _a.mapSize !== 'undefined') densityAbortMsg = 'Density file size is '+ parseInt(_a.mapSize) +' MB. You can download it using the <strong>\'Download Density\'</strong> option in Controls.';
							Bootstrap.Command.Toast.Show.dispatch(ctx, { key: 'density-abort-toast', title: 'Density', message: densityAbortMsg });
							Bootstrap.Event.Visual.VisualSelectElement.getStream(ctx).subscribe(function (e) {
								Bootstrap.Command.Toast.Hide.dispatch(ctx, { key: 'density-abort-toast' });
							});
							//scope.LiteMolComponent.showControls();
						}else{
							var sel = ctx.select((_b = Tree.Selection).byRef.apply(_b, refs));
							if (sel.length === refs.length) {
								ctx.logger.message('Density loaded, click on a residue or an atom to view the data.');
							}
							else if (sel.length > 0) {
								ctx.logger.message('Density partially loaded, click on a residue or an atom to view the data.');
							}
							else {
								ctx.logger.error("Density for ID '" + id + "' failed to load.");
								if (groupRef) {
									Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, groupRef);
								}
							}
							var _b;
							
							//Remove 'RemoveNode' to hide Download density control
							Bootstrap.Command.Toast.Hide.dispatch(ctx, { key: 'density-abort-toast' });
							if(scope.treeMenu == false || scope.treeMenu == 'false'){
								var abortMapDownloadRef = ctx.select('abortMapDownload')[0];
								if(typeof abortMapDownloadRef !== 'undefined') Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, 'abortMapDownload');
							}
						}
					});
				})(Data = PDBe.Data || (PDBe.Data = {}));
			})(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
		})(Viewer = Viewer || (Viewer = {}));
		
		//Validation data annotation
		var Viewer;
		(function (Viewer) {
			var PDBe;
			(function (PDBe) {
				var Validation;
				(function (Validation) {
					var Entity = LiteMol.Bootstrap.Entity;
					var Transformer = LiteMol.Bootstrap.Entity.Transformer;
					Validation.Report = Entity.create({ name: 'PDBe Molecule Validation Report', typeClass: 'Behaviour', shortName: 'VR', description: 'Represents PDBe validation report.' });
					var Api;
					(function (Api) {
						function getResidueId(seqNumber, insCode) {
							var id = seqNumber.toString();
							if ((insCode || "").length !== 0)
								id += " " + insCode;
							return id;
						}
						Api.getResidueId = getResidueId;
						function getEntry(report, modelId, entity, asymId, residueId) {
							var e = report[entity];
							if (!e)
								return void 0;
							e = e[asymId];
							if (!e)
								return void 0;
							e = e[modelId];
							if (!e)
								return void 0;
							return e[residueId];
						}
						Api.getEntry = getEntry;
						function createReport(data) {
							var report = {};
							if (!data.molecules)
								return report;
							for (var _i = 0, _a = data.molecules; _i < _a.length; _i++) {
								var entity = _a[_i];
								var chains = {};
								for (var _c = 0, _d = entity.chains; _c < _d.length; _c++) {
									var chain = _d[_c];
									var models = {};
									for (var _e = 0, _f = chain.models; _e < _f.length; _e++) {
										var model = _f[_e];
										var residues = {};
										for (var _g = 0, _h = model.residues; _g < _h.length; _g++) {
											var residue = _h[_g];
											var id = getResidueId(residue.residue_number, residue.author_insertion_code), entry = residues[id];
											if (entry) {
												entry.residues.push(residue);
												entry.numIssues = Math.max(entry.numIssues, residue.outlier_types.length);
											}
											else {
												residues[id] = {
													residues: [residue],
													numIssues: residue.outlier_types.length
												};
											}
										}
										models[model.model_id.toString()] = residues;
									}
									chains[chain.struct_asym_id] = models;
								}
								report[entity.entity_id.toString()] = chains;
							}
							return report;
						}
						Api.createReport = createReport;
					})(Api || (Api = {}));
					var Interactivity;
					(function (Interactivity) {
						var Behaviour = (function () {
							function Behaviour(context, report) {
								var _this = this;
								this.context = context;
								this.report = report;
								this.provider = function (info) {
									try {
										return _this.processInfo(info);
									}
									catch (e) {
										console.error('Error showing validation label', e);
										return void 0;
									}
								};
							}
							Behaviour.prototype.dispose = function () {
								this.context.highlight.removeProvider(this.provider);
							};
							Behaviour.prototype.register = function (behaviour) {
								this.context.highlight.addProvider(this.provider);
							};
							Behaviour.prototype.processInfo = function (info) {
								var i = LiteMol.Bootstrap.Interactivity.Molecule.transformInteraction(info);
								if (!i || i.residues.length > 1)
									return void 0;
								var r = i.residues[0];
								var e = Api.getEntry(this.report, i.modelId, r.chain.entity.entityId, r.chain.asymId, Api.getResidueId(r.seqNumber, r.insCode));
								if (!e)
									return void 0;
								var label;
								if (e.residues.length === 1) {
									var vr = e.residues[0];
									label = 'Validation: ';
									if (!vr.outlier_types.length)
										label += 'no issue';
									else
										label += "<b>" + e.residues[0].outlier_types.join(", ") + "</b>";
									return label;
								}
								else {
									label = '';
									var index = 0;
									for (var _i = 0, _a = e.residues; _i < _a.length; _i++) {
										var v = _a[_i];
										if (index > 0)
											label += ', ';
										label += "Validation (altLoc " + v.alt_code + "): <b>" + v.outlier_types.join(", ") + "</b>";
										index++;
									}
									return label;
								}
							};
							return Behaviour;
						}());
						Interactivity.Behaviour = Behaviour;
					})(Interactivity || (Interactivity = {}));
					var Theme;
					(function (Theme) {
						var colorMap = (function () {
							var colors = new Map();
							colors.set(0, { r: 0, g: 1, b: 0 });
							colors.set(1, { r: 1, g: 1, b: 0 });
							colors.set(2, { r: 1, g: 0.5, b: 0 });
							colors.set(3, { r: 1, g: 0, b: 0 });
							return colors;
						})();
						var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
						var selectionColor = { r: 0, g: 0, b: 1 };
						var highlightColor = { r: 1, g: 0, b: 1 };
						function createResidueMapNormal(model, report) {
							var map = new Uint8Array(model.residues.count);
							var mId = model.modelId;
							var _a = model.residues, asymId = _a.asymId, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode;
							for (var i = 0, _b = model.residues.count; i < _b; i++) {
								var e = Api.getEntry(report, mId, entityId[i], asymId[i], Api.getResidueId(seqNumber[i], insCode[i]));
								if (e) {
									map[i] = Math.min(e.numIssues, 3);
								}
							}
							return map;
						}
						function createResidueMapComputed(model, report) {
							var map = new Uint8Array(model.residues.count);
							var mId = model.modelId;
							var parent = model.parent;
							var _a = model.residues, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode, chainIndex = _a.chainIndex;
							var sourceChainIndex = model.chains.sourceChainIndex;
							var asymId = parent.chains.asymId;
							for (var i = 0, _b = model.residues.count; i < _b; i++) {
								var aId = asymId[sourceChainIndex[chainIndex[i]]];
								var e = Api.getEntry(report, mId, entityId[i], aId, Api.getResidueId(seqNumber[i], insCode[i]));
								if (e) {
									map[i] = Math.min(e.numIssues, 3);
								}
							}
							return map;
						}
						function create(entity, report) {
							var model = entity.props.model;
							var map = model.source === LiteMol.Core.Structure.MoleculeModelSource.File
								? createResidueMapNormal(model, report)
								: createResidueMapComputed(model, report);
							var colors = new Map();
							colors.set('Uniform', defaultColor);
							colors.set('Selection', selectionColor);
							colors.set('Highlight', highlightColor);
							var residueIndex = model.atoms.residueIndex;
							var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[residueIndex[i]]; }, colorMap, defaultColor);
							return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
						}
						Theme.create = create;
					})(Theme || (Theme = {}));
					var Create = LiteMol.Bootstrap.Tree.Transformer.create({
						id: 'pdbe-validation-create',
						name: 'PDBe Validation',
						description: 'Create the validation report from a string.',
						from: [Entity.Data.String],
						to: [Validation.Report],
						defaultParams: function () { return ({}); }
					}, function (context, a, t) {
						return LiteMol.Bootstrap.Task.create("Validation Report (" + t.params.id + ")", 'Normal', function (ctx) {
							ctx.update('Parsing...');
							ctx.schedule(function () {
								var data = JSON.parse(a.props.data);
								var model = data[t.params.id];
								var report = Api.createReport(model || {});
								ctx.resolve(Validation.Report.create(t, { label: 'Validation Report', behaviour: new Interactivity.Behaviour(context, report), ref: 'validation-visual' }));
							});
						}).setReportTime(true);
					});
					Validation.CustomDownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
						id: 'pdbe-validation-download-and-create',
						name: 'PDBe Validation Report',
						description: 'Download Validation Report from PDBe',
						from: [Entity.Root],
						to: [Entity.Action],
						defaultParams: function () { return ({}); },
						customController: function (ctx, t, e) { return new LiteMol.Bootstrap.Components.Transform.Controller(ctx, t, e, false); }
					}, function (context, a, t) {
						var id = t.params.id.trim().toLocaleLowerCase();
						var action = LiteMol.Bootstrap.Tree.Transform.build()
							.add(a, Transformer.Data.Download, { url: "//www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/" + id, type: 'String', id: id, description: 'Validation Data' })
							.then(Create, { id: id }, { isBinding: true, ref: 'validation-model' });
						return action;
					}, "Validation report loaded. Hovering over residue will now contain validation info. To apply validation coloring, select the entity in the tree and apply it the right panel.");
					Validation.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
						id: 'pdbe-validation-download-and-create',
						name: 'PDBe Validation Report',
						description: 'Download Validation Report from PDBe',
						from: [Entity.Molecule.Molecule],
						to: [Entity.Action],
						defaultParams: function () { return ({}); },
						customController: function (ctx, t, e) { return new LiteMol.Bootstrap.Components.Transform.Controller(ctx, t, e, false); }
					}, function (context, a, t) {
						var id = a.props.molecule.id.trim().toLocaleLowerCase();
						var action = LiteMol.Bootstrap.Tree.Transform.build()
							.add(a, Transformer.Data.Download, { url: "//www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/" + id, type: 'String', id: id, description: 'Validation Data' })
							.then(Create, { id: id }, { isBinding: true });
						return action;
					}, "Validation report loaded. Hovering over residue will now contain validation info. To apply validation coloring, select the entity in the tree and apply it the right panel.");
					Validation.ApplyTheme = LiteMol.Bootstrap.Tree.Transformer.create({
						id: 'pdbe-validation-apply-theme',
						name: 'Apply Coloring',
						description: 'Colors all visuals using the validation report.',
						from: [Validation.Report],
						to: [Entity.Action],
						defaultParams: function () { return ({}); }
					}, function (context, a, t) {
						return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) {
							var molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(context.select('polymer-visual')[0], LiteMol.Bootstrap.Entity.Molecule.Molecule);
							if (!molecule) {
								ctx.reject('No suitable parent found.');
								return;
							}
							var themes = new Map();
							var visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
							
							for (var _i = 0, visuals_1 = visuals; _i < visuals_1.length; _i++) {
								var v = visuals_1[_i];
								var model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
								if (!model)
									continue;
								var theme = themes.get(model.id);
								if (!theme) {
									theme = Theme.create(model, a.props.behaviour.report);
									themes.set(model.id, theme);
								}
								LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
							}
							context.logger.message('Validation coloring applied.');
							ctx.resolve(LiteMol.Bootstrap.Tree.Node.Null);
						});
					});
				})(Validation = PDBe.Validation || (PDBe.Validation = {}));
			})(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
		})(Viewer = Viewer || (Viewer = {}));
		
		
		//Sequence Annotation
		var Viewer;
		(function (Viewer) {
			var PDBe;
			(function (PDBe) {
				var SequenceAnnotation;
				(function (SequenceAnnotation) {
					var Entity = LiteMol.Bootstrap.Entity;
					var Transformer = LiteMol.Bootstrap.Entity.Transformer;
					var Query = LiteMol.Core.Structure.Query;
					SequenceAnnotation.Annotations = Entity.create({ name: 'PDBe Sequence Annotations', typeClass: 'Data', shortName: 'SA', description: 'Represents PDBe sequence annotation data.' });
					SequenceAnnotation.Annotation = Entity.create({ name: 'PDBe Sequence Annotation', typeClass: 'Object', shortName: 'SA', description: 'Represents PDBe sequence annotation.' }, { isSilent: true, isFocusable: true });
					SequenceAnnotation.Behaviour = Entity.create({ name: 'PDBe Sequence Annotation Behaviour', typeClass: 'Behaviour', shortName: 'SA', description: 'Represents PDBe sequence annoation behaviour.' });
					var Interactivity;
					(function (Interactivity) {
						var Behaviour = (function () {
							function Behaviour(context) {
								var _this = this;
								this.context = context;
								this.node = void 0;
								this.current = void 0;
								this.subs = [];
								this.toHighlight = void 0;
								this.isHighlightOn = false;
								this.__highlight = LiteMol.Core.Utils.debounce(function () { return _this.highlight(); }, 33);
							}
							Behaviour.prototype.dispose = function () {
								this.resetTheme();
								for (var _i = 0, _a = this.subs; _i < _a.length; _i++) {
									var sub = _a[_i];
									sub.dispose();
								}
								this.subs = [];
								this.node = void 0;
							};
							Behaviour.prototype.register = function (behaviour) {
								var _this = this;
								this.node = behaviour;
								this.subs.push(this.context.behaviours.currentEntity.subscribe(function (e) { return _this.update(e); }));
								this.subs.push(LiteMol.Bootstrap.Command.Entity.Highlight.getStream(this.context).subscribe(function (e) {
									if (e.data.entities.length === 1) {
										var a = e.data.entities[0];
										if (a.type !== SequenceAnnotation.Annotation)
											return;
										_this.toHighlight = a;
										_this.isHighlightOn = e.data.isOn;
										_this.__highlight();
									}
								}));
								this.subs.push(LiteMol.Bootstrap.Command.Entity.Focus.getStream(this.context).subscribe(function (e) {
									if (e.data.length === 1) {
										var a = e.data[0];
										if (a.type !== SequenceAnnotation.Annotation)
											return;
										_this.focus(a);
									}
								}));
							};
							Object.defineProperty(Behaviour.prototype, "molecule", {
								get: function () {
									return LiteMol.Bootstrap.Utils.Molecule.findMolecule(this.node);
								},
								enumerable: true,
								configurable: true
							});
							Behaviour.prototype.resetTheme = function () {
								var molecule = this.molecule;
								if (molecule) {
									LiteMol.Bootstrap.Command.Visual.ResetTheme.dispatch(this.context, { selection: LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree() });
								}
							};
							Behaviour.prototype.getCached = function (a, model) {
								return this.context.entityCache.get(a, "theme-" + model.id);
							};
							Behaviour.prototype.setCached = function (a, model, theme) {
								var e = this.context.entityCache.set(a, "theme-" + model.id, theme);
							};
							Behaviour.prototype.highlight = function () {
								var e = this.toHighlight;
								this.toHighlight = void 0;
								if (!e || e.type !== SequenceAnnotation.Annotation)
									return;
								var a = e;
								if (!this.isHighlightOn) {
									if (this.current) {
										this.update(this.current);
									}
									else {
										this.resetTheme();
									}
								}
								else {
									this.apply(a);
								}
							};
							Behaviour.prototype.focus = function (a) {
								var molecule = this.molecule;
								if (!molecule)
									return;
								var model = this.context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Model))[0];
								if (!model)
									return;
								LiteMol.Bootstrap.Command.Molecule.FocusQuery.dispatch(this.context, { model: model, query: a.props.query });
								LiteMol.Bootstrap.Command.Entity.SetCurrent.dispatch(this.context, a);
							};
							Behaviour.prototype.apply = function (a) {
								var molecule = this.molecule;
								if (!molecule)
									return;
								var visuals = this.context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
								for (var _i = 0, visuals_2 = visuals; _i < visuals_2.length; _i++) {
									var v = visuals_2[_i];
									var model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
									if (!model)
										continue;
									var theme = this.getCached(a, model);
									if (!theme) {
										theme = Theme.create(model, a.props.query, a.props.color);
										this.setCached(a, model, theme);
									}
									LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(this.context, { visual: v, theme: theme });
								}
							};
							Behaviour.prototype.update = function (e) {
								if (!e || e.type !== SequenceAnnotation.Annotation) {
									if (this.current)
										this.resetTheme();
									this.current = void 0;
									return;
								}
								this.current = e;
								this.apply(this.current);
							};
							return Behaviour;
						}());
						Interactivity.Behaviour = Behaviour;
					})(Interactivity || (Interactivity = {}));
					var Theme;
					(function (Theme) {
						var defaultColor = { r: 1, g: 1, b: 1 };
						var selectionColor = LiteMol.Visualization.Theme.Default.SelectionColor;
						var highlightColor = LiteMol.Visualization.Theme.Default.HighlightColor;
						function createResidueMap(model, fs) {
							var map = new Uint8Array(model.residues.count);
							var mId = model.modelId;
							var residueIndex = model.atoms.residueIndex;
							var _a = model.residues, asymId = _a.asymId, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode;
							for (var _i = 0, _b = fs.fragments; _i < _b.length; _i++) {
								var f = _b[_i];
								for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
									var i = _d[_c];
									map[residueIndex[i]] = 1;
								}
							}
							return map;
						}
						function create(entity, query, color) {
							var model = entity.props.model;
							var q = Query.Builder.toQuery(query);
							var fs = q(model.queryContext);
							var map = createResidueMap(model, fs);
							var colors = new Map();
							colors.set('Uniform', defaultColor);
							colors.set('Bond', defaultColor);
							colors.set('Selection', selectionColor);
							colors.set('Highlight', highlightColor);
							var colorMap = new Map();
							colorMap.set(1, color);
							var residueIndex = model.atoms.residueIndex;
							var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[residueIndex[i]]; }, colorMap, defaultColor);
							return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
						}
						Theme.create = create;
					})(Theme || (Theme = {}));
					SequenceAnnotation.Theme = Theme;
					function buildAnnotations(parent, id, data) {
						var action = LiteMol.Bootstrap.Tree.Transform.build();
						if (!data) {
							return action;
						}
						var baseColor = LiteMol.Visualization.Color.fromHex(0xFA6900);
						var _loop_1 = function(g) {
							var ans = data[g];
							if (!ans)
								return "continue";
							var entries = Object.keys(ans).filter(function (a) { return Object.prototype.hasOwnProperty.call(ans, a); });
							if (!entries.length)
								return "continue";
							var group = action.add(parent, Transformer.Basic.CreateGroup, { label: g, isCollapsed: true }, { isBinding: true, ref: g });
							for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
								var a = entries_1[_i];
								group.then(SequenceAnnotation.CreateSingle, { data: ans[a], id: a, color: baseColor });
							}
						};
						for (var _a = 0, _b = ["Pfam", "InterPro", "CATH", "SCOP", "UniProt"]; _a < _b.length; _a++) {
							var g = _b[_a];
							var state_1 = _loop_1(g);
							if (state_1 === "continue") continue;
						}
						action.add(parent, CreateBehaviour, {}, { isHidden: true, ref: 'domain-annotation-model' });
						return action;
					}
					function getInsCode(v) {
						if (v.length === 0)
							return null;
						return v;
					}
					SequenceAnnotation.CreateSingle = LiteMol.Bootstrap.Tree.Transformer.create({
						id: 'pdbe-sequence-annotations-create-single',
						name: 'PDBe Sequence Annotation',
						description: 'Create a sequence annotation object.',
						from: [],
						to: [SequenceAnnotation.Annotation],
						defaultParams: function () { return ({}); },
						isUpdatable: true
					}, function (context, a, t) {
						return LiteMol.Bootstrap.Task.create("Sequence Annotation", 'Background', function (ctx) {
							var data = t.params.data;
							var query = Query.or.apply(null, data.mappings.map(function (m) {
								return Query.sequence(m.entity_id.toString(), m.struct_asym_id, { seqNumber: m.start.residue_number, insCode: getInsCode(m.start.author_insertion_code) }, { seqNumber: m.end.residue_number, insCode: getInsCode(m.end.author_insertion_code) });
							}))
								.union();
							ctx.resolve(SequenceAnnotation.Annotation.create(t, { label: data.identifier, description: t.params.id, query: query, color: t.params.color }, {ref: data.identifier}));
						});
					});
					var Parse = LiteMol.Bootstrap.Tree.Transformer.create({
						id: 'pdbe-sequence-annotations-parse',
						name: 'PDBe Sequence Annotations',
						description: 'Parse sequence annotaions JSON.',
						from: [Entity.Data.String],
						to: [SequenceAnnotation.Annotations],
						defaultParams: function () { return ({}); }
					}, function (context, a, t) {
						return LiteMol.Bootstrap.Task.create("Sequence Annotations", 'Normal', function (ctx) {
							ctx.update('Parsing...');
							ctx.schedule(function () {
								var data = JSON.parse(a.props.data);
								ctx.resolve(SequenceAnnotation.Annotations.create(t, { label: 'Sequence Annotations', data: data }));
							});
						}).setReportTime(true);
					});
					var CreateBehaviour = LiteMol.Bootstrap.Tree.Transformer.create({
						id: 'pdbe-sequence-annotations-create-behaviour',
						name: 'PDBe Sequence Annotation Behaviour',
						description: 'Create sequence annotation behaviour.',
						from: [SequenceAnnotation.Annotations],
						to: [SequenceAnnotation.Behaviour],
						defaultParams: function () { return ({}); }
					}, function (context, a, t) {
						return LiteMol.Bootstrap.Task.resolve("Sequence Annotations", 'Background', SequenceAnnotation.Behaviour.create(t, { label: 'Sequence Annotations', behaviour: new Interactivity.Behaviour(context) }));
					});
					var Build = LiteMol.Bootstrap.Tree.Transformer.action({
						id: 'pdbe-sequence-annotations-build',
						name: 'PDBe Sequence Annotations',
						description: 'Build sequence validations behaviour.',
						from: [SequenceAnnotation.Annotations],
						to: [Entity.Action],
						defaultParams: function () { return ({}); }
					}, function (context, a, t) {
						var data = a.props.data;
						var keys = Object.keys(data);
						return buildAnnotations(a, keys[0], data[keys[0]]);
					}, "Sequence annotations downloaded. Selecting or hovering an annotation in the tree will color the visuals.");
					SequenceAnnotation.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
						id: 'pdbe-sequence-annotations-download-and-create',
						name: 'PDBe Sequence Annotations',
						description: 'Download Sequence Annotations from PDBe',
						from: [Entity.Molecule.Molecule],
						to: [Entity.Action],
						defaultParams: function () { return ({}); },
						customController: function (ctx, t, e) { return new LiteMol.Bootstrap.Components.Transform.Controller(ctx, t, e, false); }
					}, function (context, a, t) {
						var id = a.props.molecule.id.trim().toLocaleLowerCase();
						return LiteMol.Bootstrap.Tree.Transform.build()
							.add(a, Transformer.Data.Download, { url: "//www.ebi.ac.uk/pdbe/api/mappings/" + id, type: 'String', id: id, description: 'Annotation Data' })
							.then(Parse, {}, { isBinding: true })
							.then(Build, {}, { isBinding: true });
					});
					SequenceAnnotation.CustomDownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
						id: 'pdbe-sequence-annotations-download-and-create',
						name: 'PDBe Sequence Annotations',
						description: 'Download Sequence Annotations from PDBe',
						from: [Entity.Root],
						to: [Entity.Action],
						defaultParams: function () { return ({}); },
						customController: function (ctx, t, e) { return new LiteMol.Bootstrap.Components.Transform.Controller(ctx, t, e, false); }
					}, function (context, a, t) {
						var id = t.params.id.trim().toLocaleLowerCase();
						return LiteMol.Bootstrap.Tree.Transform.build()
							.add(a, Transformer.Data.Download, { url: "//www.ebi.ac.uk/pdbe/api/mappings/" + id, type: 'String', id: id, description: 'Annotation Data' })
							.then(Parse, {}, { isBinding: true })
							.then(Build, {}, { isBinding: true });
					});
				})(SequenceAnnotation = PDBe.SequenceAnnotation || (PDBe.SequenceAnnotation = {}));
			})(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
		})(Viewer = Viewer || (Viewer = {}));
		
		//HTML like syntax implementation for adding sequence annotaions
		var Viewer;
		(function (Viewer) {
			var PDBe;
			(function (PDBe) {
				var Views;
				(function (Views) {
					var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
					var Controls = LiteMol.Plugin.Controls;
					var CreateSequenceAnnotationView = (function (_super) {
						__extends(CreateSequenceAnnotationView, _super);
						function CreateSequenceAnnotationView() {
							_super.apply(this, arguments);
						}
						CreateSequenceAnnotationView.prototype.renderControls = function () {
							var _this = this;
							var params = this.params;
							return React.createElement("div", null, React.createElement(Controls.ToggleColorPicker, {label: 'Color', color: params.color, onChange: function (c) { return _this.controller.autoUpdateParams({ color: c }); }, position: 'below'}));
						};
						return CreateSequenceAnnotationView;
					}(LiteMol.Plugin.Views.Transform.ControllerBase));
					Views.CreateSequenceAnnotationView = CreateSequenceAnnotationView;
					var DownloadBinaryCIFFromCoordinateServerView = (function (_super) {
						__extends(DownloadBinaryCIFFromCoordinateServerView, _super);
						function DownloadBinaryCIFFromCoordinateServerView() {
							_super.apply(this, arguments);
						}
						DownloadBinaryCIFFromCoordinateServerView.prototype.renderControls = function () {
							var _this = this;
							var params = this.params;
							return React.createElement("div", null, React.createElement(Controls.TextBoxGroup, {value: params.id, onChange: function (v) { return _this.updateParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter pdb id...'}), React.createElement(Controls.OptionsGroup, {options: ['Cartoon', 'Full'], caption: function (s) { return s; }, current: params.type, onChange: function (o) { return _this.updateParams({ type: o }); }, label: 'Type', title: 'Determines whether to send all atoms or just atoms that are needed for the Cartoon representation.'}), React.createElement(Controls.Toggle, {onChange: function (v) { return _this.updateParams({ lowPrecisionCoords: v }); }, value: params.lowPrecisionCoords, label: 'Low Precicion', title: 'If on, sends coordinates with 1 digit precision instead of 3. This saves up to 50% of data that need to be sent.'}), React.createElement(Controls.TextBoxGroup, {value: params.serverUrl, onChange: function (v) { return _this.updateParams({ serverUrl: v }); }, label: 'Server', title: 'The base URL of the CoordinateServer.', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter server URL...'}));
						};
						return DownloadBinaryCIFFromCoordinateServerView;
					}(LiteMol.Plugin.Views.Transform.ControllerBase));
					Views.DownloadBinaryCIFFromCoordinateServerView = DownloadBinaryCIFFromCoordinateServerView;
					var DownloadDensityView = (function (_super) {
                    __extends(DownloadDensityView, _super);
                    function DownloadDensityView() {
                        return _super.apply(this, arguments) || this;
                    }
                    DownloadDensityView.prototype.getId = function () {
                        var id = this.params.id;
                        if (!id)
                            return '';
                        if (typeof id === 'string')
                            return id;
                        return id[this.params.sourceId];
                    };
                    DownloadDensityView.prototype.updateId = function (newId) {
                        var params = this.params;
                        var id = params.id;
                        if (!id || typeof id === 'string')
                            id = (_a = {}, _a[params.sourceId] = newId, _a);
                        else
                            id = LiteMol.Bootstrap.Utils.merge(id, (_b = {}, _b[params.sourceId] = newId, _b));
                        this.updateParams({ id: id });
                        var _a, _b;
                    };
                    DownloadDensityView.prototype.renderControls = function () {
                        var _this = this;
                        var params = this.params;
                        return React.createElement("div", null,
                            React.createElement(Controls.OptionsGroup, { options: PDBe.Data.DensitySources, caption: function (s) { return PDBe.Data.DensitySourceLabels[s]; }, current: params.sourceId, onChange: function (o) { return _this.updateParams({ sourceId: o }); }, label: 'Source', title: 'Determines where to obtain the data.' }),
                            React.createElement(Controls.TextBoxGroup, { value: this.getId(), onChange: function (v) { return _this.updateId(v); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter id...' }));
                    };
                    return DownloadDensityView;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                Views.DownloadDensityView = DownloadDensityView;
				})(Views = PDBe.Views || (PDBe.Views = {}));
			})(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
		})(Viewer = Viewer || (Viewer = {}));
		
		//Custom respresentation for menu
		var Viewer;
		(function (Viewer) {
			var Custom;
			(function (Custom) {
				var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
				var Controls = LiteMol.Plugin.Controls;
				var RepresentationView = (function (_super) {
					__extends(RepresentationView, _super);
					function RepresentationView() {
						_super.apply(this, arguments);
					}
					RepresentationView.prototype.asm = function () {
						var _this = this;
						var n = this.params.params ? this.params.params.name : this.params.assemblyNames[0];
						if (!n)
							n = this.params.assemblyNames[0];
						return [React.createElement(Controls.OptionsGroup, {options: this.params.assemblyNames, current: n, onChange: function (o) { return _this.updateParams({ params: { name: o } }); }, label: 'Asm. Name'})];
					};
					RepresentationView.prototype.symm = function () {
						var _this = this;
						var options = ['Mates', 'Interaction'];
						var params = this.params.params;
						return [React.createElement(Controls.OptionsGroup, {options: options, current: params.type, onChange: function (o) { return _this.updateParams({ params: { type: o, radius: params.radius } }); }, label: 'Type', title: 'Mates: copies whole asymetric unit. Interaction: Includes only residues that are no more than `radius` from the asymetric unit.'}),
							React.createElement(Controls.Slider, {label: 'Radius', onChange: function (v) { return _this.updateParams({ params: { type: params.type, radius: v } }); }, min: 0, max: 25, step: 0.1, value: params.radius, title: 'Interaction radius.'})];
					};
					RepresentationView.prototype.updateSource = function (source) {
						switch (source) {
							case 'Assembly':
								this.updateParams({ source: source, params: { name: this.params.assemblyNames[0] } });
								break;
							case 'Symmetry':
								this.updateParams({ source: source, params: { type: 'Mates', radius: 5.0 } });
								break;
							default:
								this.updateParams({ source: 'Asymmetric Unit' });
								break;
						}
					};
					RepresentationView.prototype.renderControls = function () {
						var _this = this;
						var params = this.params;
						var molecule = this.controller.entity.props.molecule;
						var model = molecule.models[0];
						var options = ['Asymmetric Unit'];
						if (params.assemblyNames && params.assemblyNames.length > 0)
							options.push('Assembly');
						if (model.symmetryInfo)
							options.push('Symmetry');
						var modelIndex = molecule.models.length > 1
							? React.createElement(Controls.Slider, {label: 'Model', onChange: function (v) { return _this.updateParams({ modelIndex: v - 1 }); }, min: 1, max: molecule.models.length, step: 1, value: params.modelIndex + 1, title: 'Interaction radius.'})
							: void 0;
						return React.createElement("div", null, 
							React.createElement(Controls.OptionsGroup, {options: options, caption: function (s) { return s; }, current: params.source, onChange: function (o) { return _this.updateSource(o); }, label: 'Source'}), 
							params.source === 'Assembly'
								? this.asm()
								: params.source === 'Symmetry'
									? this.symm()
									: void 0, 
							modelIndex);
					};
					return RepresentationView;
				}(LiteMol.Plugin.Views.Transform.ControllerBase));
				Custom.RepresentationView = RepresentationView;
			})(Custom = Viewer.Custom || (Viewer.Custom = {}));
		})(Viewer || (Viewer = {}));

		var Viewer;
		(function (Viewer) {
			var Custom;
			(function (Custom) {
				var Entity = LiteMol.Bootstrap.Entity;
				var Transformer = LiteMol.Bootstrap.Entity.Transformer;
				Custom.CreateRepresentation = LiteMol.Bootstrap.Tree.Transformer.action({
					id: 'lm-custom-create-representation',
					name: 'Representation',
					description: 'Create visual representation from the selected source.',
					from: [Entity.Molecule.Molecule],
					to: [Entity.Action],
					defaultParams: function (ctx, e) {
						var m = LiteMol.Bootstrap.Utils.Molecule.findMolecule(e).props.molecule.models[0];
						var asm = m.assemblyInfo;
						if (!asm || !asm.assemblies.length)
							return { source: 'Asymmetric Unit', assemblyNames: [] };
						return { source: 'Asymmetric Unit', assemblyNames: asm.assemblies.map(function (a) { return a.name; }), modelIndex: 0 };
					}
				}, function (context, a, t) {
					// remove any old representation
					var children = LiteMol.Bootstrap.Tree.Selection.byRef('molecule').children();
					LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(context, children);
					var action = LiteMol.Bootstrap.Tree.Transform.build().add(a, Transformer.Molecule.CreateModel, { modelIndex: t.params.modelIndex || 0 }, { ref: 'model' });
					var visualParams = {
						polymer: true,
						polymerRef: 'polymer-visual',
						het: true,
						hetRef: 'het-visual',
						water: true,
						waterRef: 'water-visual'
					};
					switch (t.params.source || 'Asymmetric Unit') {
						case 'Assembly':
							action
								.then(Transformer.Molecule.CreateAssembly, t.params.params)
								.then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
							break;
						case 'Symmetry':
							action
								.then(Transformer.Molecule.CreateSymmetryMates, t.params.params)
								.then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
							break;
						default:
							action.then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
							break;
					}
					return action;
				});
			})(Custom = Viewer.Custom || (Viewer.Custom = {}));
		})(Viewer || (Viewer = {}));
		
		var Viewer;
		(function (Viewer) {
			var Custom;
			(function (Custom) {
				var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
				var Controls = LiteMol.Plugin.Controls;
				var SeqAnnotationView = (function (_super) {
					__extends(SeqAnnotationView, _super);
					function SeqAnnotationView() {
						_super.apply(this, arguments);
					}
					SeqAnnotationView.prototype.domainList = function () {
						var _this = this;
						var subOptionsList = this.params.subOptionsList[this.params.type];
						var totalSuboptions = subOptionsList.length;
						var options = [];
						var refDict = {};
						for(var oi=0; oi < totalSuboptions; oi++){
							options.push(subOptionsList[oi].name)
							refDict[subOptionsList[oi].name] = subOptionsList[oi].ref;
						}
						var currentVal = this.params.nodeName;
						if(!currentVal) currentVal = options[0];
						return [React.createElement(Controls.OptionsGroup, {options: options, current: currentVal, caption: function (s) { return s; }, onChange: function (o) { 
							return _this.updateParams({ nodeName: o, nodeRef: refDict[o] });
						}, label: 'Name'})];
					};
					SeqAnnotationView.prototype.updateType = function (selectedType) {
						if(selectedType === 'Select'){
							this.updateParams({ type: selectedType, nodeName: undefined, nodeRef: undefined });
						}else{
							var nodeNameVal = this.params.subOptionsList[selectedType][0].name;
							var nodeRefVal = this.params.subOptionsList[selectedType][0].ref;
							this.updateParams({ type: selectedType, nodeName: nodeNameVal, nodeRef: nodeRefVal });
						}
					};
					SeqAnnotationView.prototype.renderControls = function () {
						var _this = this;
						var params = this.params;
						return React.createElement("div", null, React.createElement(Controls.OptionsGroup, {options: params.options, caption: function (s) { return s; }, current: params.type, 
							onChange: function (o) { return _this.updateType(o); }, label: 'Type'}), params.type === 'Select' ? void 0 : this.domainList());
					};
					return SeqAnnotationView;
				}(LiteMol.Plugin.Views.Transform.ControllerBase));
				Custom.SeqAnnotationView = SeqAnnotationView;
			})(Custom = Viewer.Custom || (Viewer.Custom = {}));
		})(Viewer || (Viewer = {}));
		
		var Viewer;
		(function (Viewer) {
			var Custom;
			(function (Custom) {
				var Entity = LiteMol.Bootstrap.Entity;
				var Transformer = LiteMol.Bootstrap.Entity.Transformer;
				Custom.CreateSeqAnnotation = LiteMol.Bootstrap.Tree.Transformer.create({
					id: 'lm-custom-create-SeqAnnotation',
					name: 'SeqAnnotation',
					description: 'Colours all visuals as per selected Domain Annotation.',
					from: [Entity.Root],
					to: [Entity.Action],
					defaultParams: function (ctx, e) {
						
						var options = ["Select"];
						var domains = ["Pfam", "InterPro", "CATH", "SCOP", "UniProt"];
						var subOptionsList = {"Pfam": [], "InterPro": [], "CATH": [], "SCOP": [], "UniProt": []};
						var domainRefList;
						for(var i=0; i<5; i++){
							var domainNode = ctx.select(domains[i])[0];
							if(typeof domainNode !== 'undefined' && domainNode.children.length > 0){
								options.push(domains[i]);
								for(var di=0; di < domainNode.children.length; di++){
									var domainName = domainNode.children[di].props.label;
									subOptionsList[domains[i]].push({
										name: domainName,
										ref: domainNode.children[di].ref
									});
								}
							}
						}
						return {'type': 'Select', 'nodeRef': undefined, nodeName: undefined, 'options': options, 'subOptionsList': subOptionsList};
						
					}
				}, function (context, a, t) {
					return LiteMol.Bootstrap.Task.create('Domain Annotation', 'Background', function (ctx) {
						var molecule = a;
						if (!molecule) {
							ctx.reject('No suitable parent found.');
							return;
						}
						if (!t.params.nodeRef) {
							ctx.reject('Select valid Domain.');
							return;
						}
						var b = context.select(t.params.nodeRef)[0];
						var visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
						for (var _i = 0, visuals_2 = visuals; _i < visuals_2.length; _i++) {
							var v = visuals_2[_i];
							var model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
							if (!model)
								continue;
							var theme = context.entityCache.get(b, "theme-" + model.id);
							if (!theme) {
								theme = Viewer.PDBe.SequenceAnnotation.Theme.create(model, b.props.query, b.props.color);
								context.entityCache.set(b, "theme-" + model.id, theme);
							}
							LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
						}
						
						context.logger.message('Domain annotation applied.');
						ctx.resolve(LiteMol.Bootstrap.Tree.Node.Null);
						
					});
					
				});
			})(Custom = Viewer.Custom || (Viewer.Custom = {}));
		})(Viewer || (Viewer = {}));
		
		var LiteMolComponent = (function () {
			function LiteMolComponent() {
				this.Plugin = LiteMol.Plugin;
				this.Views = this.Plugin.Views;
				this.Bootstrap = LiteMol.Bootstrap;
				this.Entity = this.Bootstrap.Entity;
				// everything same as before, only the namespace changed.
				this.Query = LiteMol.Core.Structure.Query;
				// You can look at what transforms are available in Bootstrap/Entity/Transformer
				// They are well described there and params are given as interfaces.    
				this.Transformer = this.Bootstrap.Entity.Transformer;
				this.Tree = this.Bootstrap.Tree;
				this.Transform = this.Tree.Transform;
				this.LayoutRegion = this.Bootstrap.Components.LayoutRegion;
				this.CoreVis = LiteMol.Visualization;
				this.Visualization = this.Bootstrap.Visualization;
				this.Command = this.Bootstrap.Command;
				this.Event = this.Bootstrap.Event;
				this.moleculeId = scope.pdbId;
				this.currentHighLightedDetails;
				this.element = element[0];
				this.emMsgChanged = false;
				this.spec = {
					settings: {
						// currently these are all the 'global' settings available 
						'molecule.model.defaultQuery': "residues({ name: 'ALA' })",
						'molecule.model.defaultAssemblyName': '1',
						'molecule.coordinateStreaming.defaultId': '1jj2',
						'molecule.coordinateStreaming.defaultServer': '//www.ebi.ac.uk/pdbe/coordinates',
						'molecule.coordinateStreaming.defaultRadius': 10,
						'density.defaultVisualBehaviourRadius': 5
					},
					transforms: [
						// Root transforms -- things that load data.
						{ transformer: Viewer.PDBe.Data.DownloadMolecule, view: this.Views.Transform.Data.WithIdField },
						{ transformer: Viewer.PDBe.Data.DownloadDensity, view: Viewer.PDBe.Views.DownloadDensityView },
						{ transformer: Viewer.PDBe.Data.DownloadBinaryCIFFromCoordinateServer, view: Viewer.PDBe.Views.DownloadBinaryCIFFromCoordinateServerView, initiallyCollapsed: true },
						{ transformer: this.Transformer.Molecule.CoordinateStreaming.InitStreaming, view: this.Views.Transform.Molecule.InitCoordinateStreaming, initiallyCollapsed: true },
						{ transformer: Viewer.DataSources.DownloadMolecule, view: this.Views.Transform.Data.WithUrlIdField, initiallyCollapsed: true },
						{ transformer: this.Transformer.Molecule.OpenMoleculeFromFile, view: this.Views.Transform.Molecule.OpenFile, initiallyCollapsed: true },
						{ transformer: this.Transformer.Data.Download, view: this.Views.Transform.Data.Download, initiallyCollapsed: true },
						{ transformer: this.Transformer.Data.OpenFile, view: this.Views.Transform.Data.OpenFile, initiallyCollapsed: true },
						// Raw data transforms
						{ transformer: this.Transformer.Molecule.CreateFromData, view: this.Views.Transform.Molecule.CreateFromData },
						{ transformer: this.Transformer.Data.ParseCif, view: this.Views.Transform.Empty },
						{ transformer: this.Transformer.Data.ParseBinaryCif, view: this.Views.Transform.Empty },
						{ transformer: this.Transformer.Density.ParseData, view: this.Views.Transform.Density.ParseData },
						// Molecule(model) transforms
						{ transformer: this.Transformer.Molecule.CreateFromMmCif, view: this.Views.Transform.Molecule.CreateFromMmCif },
						{ transformer: this.Transformer.Molecule.CreateModel, view: this.Views.Transform.Molecule.CreateModel },
						{ transformer: this.Transformer.Molecule.CreateSelection, view: this.Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },
						{ transformer: this.Transformer.Molecule.CreateAssembly, view: this.Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
						{ transformer: this.Transformer.Molecule.CreateSymmetryMates, view: this.Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
						{ transformer: this.Transformer.Molecule.CreateMacromoleculeVisual, view: this.Views.Transform.Empty },
						{ transformer: this.Transformer.Molecule.CreateVisual, view: this.Views.Transform.Molecule.CreateVisual },
						// density transforms
						{ transformer: this.Transformer.Density.CreateVisual, view: this.Views.Transform.Density.CreateVisual },
						{ transformer: this.Transformer.Density.CreateVisualBehaviour, view: this.Views.Transform.Density.CreateVisualBehaviour },
						// Coordinate streaming
						{ transformer: this.Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: this.Views.Transform.Empty, initiallyCollapsed: true },
						// Validation report
						{ transformer: Viewer.PDBe.Validation.DownloadAndCreate, view: this.Views.Transform.Empty },
						{ transformer: Viewer.PDBe.Validation.ApplyTheme, view: this.Views.Transform.Empty },
						// annotations
						{ transformer: Viewer.PDBe.SequenceAnnotation.DownloadAndCreate, view: this.Views.Transform.Empty },
						{ transformer: Viewer.PDBe.SequenceAnnotation.CreateSingle, view: Viewer.PDBe.Views.CreateSequenceAnnotationView }
					],
					behaviours: [
						// you will find the source of all behaviours in the Bootstrap/Behaviour directory
						// keep these 2
						this.Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
						this.Bootstrap.Behaviour.FocusCameraOnSelect,
						this.Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
						// this colors the visual when a selection is created on it.
						this.Bootstrap.Behaviour.ApplySelectionToVisual,
						// you will most likely not want this as this could cause trouble
						this.Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
						// this colors the visual when it's selected by mouse or touch
						//this.Bootstrap.Behaviour.ApplyInteractivitySelection,
						// this shows what atom/residue is the pointer currently over
						this.Bootstrap.Behaviour.Molecule.HighlightElementInfo,
						// distance to the last "clicked" element
						this.Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement//,
						// when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
						// you will not want to use this for the ligand pages, where you create the same thing this does at startup
						//this.Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5)//,
					],
					components: [
						// Pretty much dont touch this :)
						this.Plugin.Components.Visualization.HighlightInfo(this.LayoutRegion.Main, true),
						this.Plugin.Components.Entity.Current('LiteMol', this.Plugin.VERSION.number)(this.LayoutRegion.Right, true),
						this.Plugin.Components.Transform.View(this.LayoutRegion.Right),
						//Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
						this.Plugin.Components.Context.Overlay(this.LayoutRegion.Root),
						this.Plugin.Components.Context.Toast(this.LayoutRegion.Main, true),
						this.Plugin.Components.Context.BackgroundTasks(this.LayoutRegion.Main, true)
					],
					viewport: {
						// dont touch this either 
						view: this.Views.Visualization.Viewport,
						controlsView: this.Views.Visualization.ViewportControls
					},
					layoutView: this.Views.Layout,
					tree: {
						// or this 
						region: this.LayoutRegion.Left,
						view: this.Views.Entity.Tree
					}
				};
				_this = this;
				this.CustomMenuSpec = {
					settings: {
						// currently these are all the 'global' settings available 
						'molecule.model.defaultQuery': "residues({ name: 'ALA' })",
						'molecule.model.defaultAssemblyName': '1',
						'molecule.coordinateStreaming.defaultId': '1jj2',
						'molecule.coordinateStreaming.defaultServer': '//www.ebi.ac.uk/pdbe/coordinates',
						'molecule.coordinateStreaming.defaultRadius': 10,
						'density.defaultVisualBehaviourRadius': 5
					},
					transforms: [
						{ transformer: this.Transformer.Molecule.CreateVisual, view: this.Views.Transform.Molecule.CreateVisual },
						{ transformer: Viewer.Custom.CreateRepresentation, view: Viewer.Custom.RepresentationView },
						// density transforms
						{ transformer: this.Transformer.Density.CreateVisual, view: this.Views.Transform.Density.CreateVisual },
						{ transformer: this.Transformer.Density.CreateVisualBehaviour, view: this.Views.Transform.Density.CreateVisualBehaviour },
						// Validation report
						{ transformer: Viewer.PDBe.Validation.CustomDownloadAndCreate, view: this.Views.Transform.Empty },
						{ transformer: Viewer.PDBe.Validation.ApplyTheme, view: this.Views.Transform.Empty },
						// annotations
						{ transformer: Viewer.Custom.CreateSeqAnnotation, view: Viewer.Custom.SeqAnnotationView },
						{ transformer: Viewer.PDBe.Data.DownloadDensity, view:  this.Views.Transform.Empty },
						{ transformer: Viewer.PDBe.Data.DensityDownloaderAction, view:  this.Views.Transform.Empty }
					],
					behaviours: [
						// you will find the source of all behaviours in the Bootstrap/Behaviour directory
						// keep these 2
						this.Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
						this.Bootstrap.Behaviour.FocusCameraOnSelect,
						this.Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
						// this colors the visual when a selection is created on it.
						this.Bootstrap.Behaviour.ApplySelectionToVisual,
						// this colors the visual when it's selected by mouse or touch
						this.Bootstrap.Behaviour.ApplyInteractivitySelection,
						// this shows what atom/residue is the pointer currently over
						this.Bootstrap.Behaviour.Molecule.HighlightElementInfo,
						// distance to the last "clicked" element
						this.Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
						// when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
						// you will not want to use this for the ligand pages, where you create the same thing this does at startup
						this.Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5)//,
						// this tracks what is downloaded and some basic actions. Does not send any private data etc.
						// While it is not required for any functionality, we as authors are very much interested in basic 
						// usage statistics of the application and would appriciate if this behaviour is used.
						//Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
					],
					components: [
						this.Plugin.Components.Visualization.HighlightInfo(this.LayoutRegion.Main, true),
						this.Plugin.Components.create('RepresentationControls', function (ctx) { return new _this.Bootstrap.Components.Transform.Action(ctx, 'molecule', Viewer.Custom.CreateRepresentation, 'Source'); }, _this.Plugin.Views.Transform.Action)(this.LayoutRegion.Right),
						this.Plugin.Components.create('ValidationControls', function (ctx) { return new _this.Bootstrap.Components.Transform.Action(ctx, 'validation-model', Viewer.PDBe.Validation.ApplyTheme, 'Validation Report'); }, _this.Plugin.Views.Transform.Action)(this.LayoutRegion.Right),
						this.Plugin.Components.create('AnnotationControls', function (ctx) { return new _this.Bootstrap.Components.Transform.Action(ctx, 'domain-annotation-model', Viewer.Custom.CreateSeqAnnotation, 'Domain Annotation'); }, _this.Plugin.Views.Transform.Action)(this.LayoutRegion.Right),
						this.Plugin.Components.create('PolymerControls', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'polymer-visual', 'Polymer Visual'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
						this.Plugin.Components.create('HetControls', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'het-visual', 'HET Groups Visual'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
						this.Plugin.Components.create('WaterControls', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'water-visual', 'Water Visual'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
						
						this.Plugin.Components.create('DensityDownloadControl', function (ctx) { return new _this.Bootstrap.Components.Transform.Action(ctx, 'abortMapDownload', Viewer.PDBe.Data.DownloadDensity, 'Download Density'); }, _this.Plugin.Views.Transform.Action)(this.LayoutRegion.Right),
						//this.Plugin.Components.create('DensityDownloadControl', function (ctx) { return new _this.Bootstrap.Components.Transform.Action(ctx, 'densityDownloader-transformer', Viewer.PDBe.Data.DownloadDensity, 'Download Density'); }, _this.Plugin.Views.Transform.Action)(this.LayoutRegion.Right),
						
						this.Plugin.Components.create('DensityControls-2fofc', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'density-2fofc', 'Density : 2Fo-Fc'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
						this.Plugin.Components.create('DensityControls-fofc_plus', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'density-fofc_minus', 'Density : Fo-Fc(-ve)'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
						this.Plugin.Components.create('DensityControls-fofc_minus', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'density-fofc_plus', 'Density : Fo-Fc(+ve)'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
						this.Plugin.Components.create('DensityControls-em-density', function (ctx) { return new _this.Bootstrap.Components.Transform.Updater(ctx, 'em-density-map', 'Density'); }, _this.Plugin.Views.Transform.Updater)(this.LayoutRegion.Right),
												
						//this.Plugin.Components.Context.Log(this.LayoutRegion.Bottom, true),
						this.Plugin.Components.Context.Overlay(this.LayoutRegion.Root),
						this.Plugin.Components.Context.Toast(this.LayoutRegion.Main, true),
						this.Plugin.Components.Context.BackgroundTasks(this.LayoutRegion.Main, true)
					],
					viewport: {
						// dont touch this either 
						view: this.Views.Visualization.Viewport,
						controlsView: this.Views.Visualization.ViewportControls
					},
					layoutView: this.Views.Layout,
					tree: void 0 // { region: LayoutRegion.Left, view: Views.Entity.Tree }
				};
			};
			LiteMolComponent.prototype.applyTransforms = function (actions) {
				return this.Tree.Transform.apply(this.plugin.context, actions).run(this.plugin.context);
			};
			LiteMolComponent.prototype.selectNodes = function(what) {
				return this.plugin.context.select(what);
			};
			LiteMolComponent.prototype.cleanUp = function() {
				// the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
				this.Command.Tree.RemoveNode.dispatch(this.plugin.context, 'sequence-selection');
			}
			LiteMolComponent.prototype.createPlugin = function() {
			 	_this = this;
				this.plugin = this.create(element[0]);
				this.Command.Layout.SetState.dispatch(this.plugin.context, { hideControls: scope.hideControls, isExpanded: scope.isExpanded });
				var select = this.Event.Molecule.ModelSelect.getStream(this.plugin.context).subscribe(function (e) {
					//return showInteraction('select', e.data);
					var dispactDataObject = _this.getDispatchEventData(e);
					//Dispatch custom click event
					_this.dispatchCustomEvent('PDB.litemol.click', dispactDataObject);
				});
				// to stop listening, select.dispose();
				var highlight = this.Event.Molecule.ModelHighlight.getStream(this.plugin.context).subscribe(function (e) {
					//return showInteraction('highlight', e.data);
					var dispactDataObject = _this.getDispatchEventData(e);
					//Dispatch custom click event
					_this.dispatchCustomEvent('PDB.litemol.mouseover', dispactDataObject);
				});
				this.Command.Visual.ResetScene.getStream(this.plugin.context).subscribe(function () { return _this.cleanUp(); });
				this.Command.Visual.ResetTheme.getStream(this.plugin.context).subscribe(function () { return _this.cleanUp(); });
				
				// you can use this to view the event/command stream
				//plugin.context.dispatcher.LOG_DISPATCH_STREAM = true;
			};
			LiteMolComponent.prototype.destroyPlugin = function() { 
				this.plugin.destroy();
				this.plugin = void 0;
			};
			LiteMolComponent.prototype.showControls = function() {
				return this.Command.Layout.SetState.dispatch(this.plugin.context, { hideControls: false }); 
			};
			LiteMolComponent.prototype.hideControls = function() { 
				return this.Command.Layout.SetState.dispatch(this.plugin.context, { hideControls: true }); 
			};
			LiteMolComponent.prototype.expand = function() { 
				return this.Command.Layout.SetState.dispatch(this.plugin.context, { isExpanded: true }); 
			};
			LiteMolComponent.prototype.setBackground = function() {
				return this.Command.Layout.SetViewportOptions.dispatch(this.plugin.context, { clearColor: this.CoreVis.Color.fromRgb(255, 255, 255) }); 
			};
			LiteMolComponent.prototype.getEMEntryData = function() {
				var id = this.moleculeId.toLowerCase();
				
				var summaryApiUrl = '//www.ebi.ac.uk/pdbe/api/pdb/entry/summary/'+id;
				
				var deferred = $q.defer();
			
				$http.get(summaryApiUrl)
				.then(function(response) {
				
					//console.log(response.data)
					deferred.resolve(response.data);
					
				}, function(response) {
					deferred.reject('fail response');
				});
			
				return deferred.promise;
				
			};
			LiteMolComponent.prototype.getEMDensityData = function(emEntryId) {
				var densityApiPath = '//www.ebi.ac.uk/pdbe/api/emdb/entry/map/'+emEntryId;
				
				var deferred = $q.defer();
			
				$http.get(densityApiPath)
				.then(function(response) {
					//console.log(response.data)
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject('fail response');
				});
			
				return deferred.promise;
				
			};
			LiteMolComponent.prototype.getMapSize = function(entryId, entryType) {
				
				var deferred = $q.defer();
				
				if(entryType == 'em'){
					
					$http.head("http://ftp.ebi.ac.uk/pub/databases/emdb/structures/" + entryId.toUpperCase() + "/map/" + entryId.replace('-','_').toLowerCase()  + ".map.gz")
					.then(function(response) {
						var fileSizeFlag = true;
						var mapByteSize = response.headers('Content-Length');
						var mapMBSize =  typeof mapByteSize !== 'undefined' ? (mapByteSize / 1024) / 1024 : undefined;
						console.log(mapMBSize+' MB');
						if(typeof mapMBSize !== 'undefined' && mapMBSize > 100){
							fileSizeFlag = false;
						}
						//console.log(response.data)
						deferred.resolve(fileSizeFlag);
					}, function(response) {
						deferred.resolve(true);
					});
				}else{
					deferred.resolve(true);
				}
			
				return deferred.promise;
				
			};
			LiteMolComponent.prototype.loadFromNonCif = function(url, format) {
				var id = this.moleculeId.toLowerCase();
				
				var action = this.Transform.build()
				.add(this.plugin.context.tree.root, this.Transformer.Data.Download, { url: url, type: format.isBinary ? 'Binary' : 'String', id: id })
			
				if(scope.treeMenu == true || scope.treeMenu == 'true'){
					action.then(this.Transformer.Molecule.CreateFromData, { format: format, customId: id }, { isBinding: true })
					.then(this.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
					.then(this.Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
				}else{
					action.then(this.Transformer.Molecule.CreateFromData, { format: format, customId: id }, { ref: 'molecule' })
					.then(Viewer.Custom.CreateRepresentation, {});
				}
				
				return action;
			};
			LiteMolComponent.prototype.loadFromCif = function(url, format) {
				var id = this.moleculeId.toLowerCase();
				
				var action = this.Transform.build()
				.add(this.plugin.context.tree.root, this.Transformer.Data.Download, { url: url, type: format.isBinary ? 'Binary' : 'String', id: id })
				.then(format.isBinary ? this.Transformer.Data.ParseBinaryCif : this.Transformer.Data.ParseCif, { id: id }, { isBinding: true, ref: 'cifDict' })
				
				if(scope.treeMenu == true || scope.treeMenu == 'true'){
					action.then(this.Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
					.then(this.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
					.then(this.Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
				}else{
					action.then(this.Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { ref: 'molecule' })
					.then(Viewer.Custom.CreateRepresentation, {});	
				}
				
				return action;
			};
			LiteMolComponent.prototype.loadMolecule = function() {
				var id = this.moleculeId.toLowerCase();
				
				//Decide the Source Url from arguments
				var url = "//www.ebi.ac.uk/pdbe/static/entry/" + id + "_updated.cif";
				if(typeof scope.customQuery !== 'undefined'){
					url = '//www.ebi.ac.uk/pdbe/coordinates/' + id + '/' + scope.customQuery;
					//url = '//webchemdev.ncbr.muni.cz/CoordinateServer/' + id + '/' + scope.customQuery;
				}
				if(typeof scope.sourceUrl !== 'undefined' && typeof scope.sourceFormat == 'undefined'){
					this.Bootstrap.Command.Toast.Show.dispatch(this.plugin.context, { key: 'format-issue', title: 'Source Format', message: 'Please specify sourceFormat!' });
					return false;
				}
				if(typeof scope.sourceUrl !== 'undefined'){
					url = scope.sourceUrl;
				}
				
				//Decide Format from arguments
				var encodingInUrlFlag = false;
				if(typeof scope.customQuery !== 'undefined' && new RegExp("encoding=bcif", "i").test(url)){
					scope.sourceFormat = 'bcif';
					encodingInUrlFlag = true;
				}
				
				var format = LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF;
				if (typeof scope.sourceFormat !== 'undefined') {
                    if (LiteMol.Core.Formats.FormatInfo.is(scope.sourceFormat)) {
                        format = scope.sourceFormat;
                    }
                    else {
                        var f = LiteMol.Core.Formats.FormatInfo.fromShortcut(LiteMol.Core.Formats.Molecule.SupportedFormats.All, scope.sourceFormat);
                        if (!f) {
                            throw new Error("'" + scope.sourceFormat + "' is not a supported format.");
                        }
                        format = f;
                    }
					
					if(typeof scope.customQuery !== 'undefined' && encodingInUrlFlag == false){
						url = new RegExp("\\?").test(url) ? url+'&encoding='+scope.sourceFormat : url+'?encoding='+scope.sourceFormat; 
					}
                }
				
				//Load Structure according to format
				if(typeof scope.sourceFormat !== 'undefined' && (scope.sourceFormat.toLowerCase() == 'sdf' || scope.sourceFormat.toLowerCase() == 'pdb')){
					var action = this.loadFromNonCif(url, format);
				}else{
					var action = this.loadFromCif(url, format);
				}
				
				this.applyTransforms(action).then(function(){
					//Load density if arg is true
					if(typeof scope.sourceFormat !== 'undefined' && scope.sourceFormat.toLowerCase() == 'sdf'){
						//if sdf	
					}else{
						if(typeof scope.loadEdMaps !== 'undefined' && scope.loadEdMaps === 'true'){
							scope.LiteMolComponent.loadDensity (false, true);
						}
					}
				});
			
			};
			LiteMolComponent.prototype.loadDensity = function(isWireframe, checkMapFileSize) {
				var _this = this;
				var id = this.moleculeId.toLowerCase();
				var entryId = id;
				
				//Decide Wireframe
				if(typeof isWireframe !== 'undefined' && isWireframe == true){
					isWireframe = true;
				}else{
					isWireframe = false;;
				}
				
				
				var action = _this.Transform.build()
						.add(_this.plugin.context.tree.root, Viewer.PDBe.Data.DownloadDensity, { id: id, isWireframe: isWireframe, checkMapFileSize: checkMapFileSize }, { ref: 'density' });
						_this.applyTransforms(action);
				
			};
			LiteMolComponent.prototype.toggleDensity = function() {
				var density = this.selectNodes('density')[0];
				if (!density)
					return;
				this.Command.Entity.SetVisibility.dispatch(this.plugin.context, { entity: density, visible: density.state.visibility === 2 /* None */ });
			};
			LiteMolComponent.prototype.loadValidationReport = function() {
				var id = this.moleculeId.toLowerCase();
				var action = this.Transform.build()
					.add(this.plugin.context.tree.root, Viewer.PDBe.Validation.CustomDownloadAndCreate, { id: id });
				this.applyTransforms(action);
			};
			LiteMolComponent.prototype.loadSequenceAnnotation = function() {
				var id = this.moleculeId.toLowerCase();
				var action = this.Transform.build()
					.add(this.plugin.context.tree.root, Viewer.PDBe.SequenceAnnotation.CustomDownloadAndCreate, { id: id });
				this.applyTransforms(action);
			};
			LiteMolComponent.prototype.createSelectionTheme = function(color) {
				// for more options also see Bootstrap/Visualization/Molecule/Theme
				var colors = new Map();
				//colors.set('Uniform', this.CoreVis.Color.fromHex(0xffffff));
				colors.set('Uniform', this.CoreVis.Color.fromRgb(207,178,178));
				colors.set('Selection', color);
				colors.set('Highlight', this.CoreVis.Theme.Default.HighlightColor);
				return this.Visualization.Molecule.uniformThemeProvider(void 0, { colors: colors });
			}
			LiteMolComponent.prototype.SelectExtractFocus = function(queryData, colorCode, showSideChains) {
				_this = this;
				var visual = this.selectNodes('polymer-visual')[0];
				if (!visual)
					return;
				this.resetThemeSelHighlight(); //clear selection
				var query = this.Query.sequence(queryData.entity_id.toString(), queryData.struct_asym_id.toString(), { seqNumber: queryData.start_residue_number }, { seqNumber: queryData.end_residue_number });
				var theme = this.createSelectionTheme(this.CoreVis.Color.fromRgb(colorCode.r, colorCode.g, colorCode.b));
				var action = this.Transform.build()
					.add(visual, this.Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
				
				//If show sidechains is true
				if(typeof showSideChains !== 'undefined' && showSideChains == true){	
					action.then(this.Transformer.Molecule.CreateVisual, { style: this.Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
				}
				this.applyTransforms(action).then(function () {
					_this.Command.Visual.UpdateBasicTheme.dispatch(_this.plugin.context, { visual: visual, theme: theme });
					_this.Command.Entity.Focus.dispatch(_this.plugin.context, _this.selectNodes('sequence-selection'));
					// alternatively, you can do this
					//Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodes('model')[0] as any, query })
				});
			};
			LiteMolComponent.prototype.highlightOn = function(queryData) {
				var model = this.selectNodes('model')[0];
				if (!model)
					return;
				if(typeof this.currentHighLightedDetails !== 'undefined'){
					this.Command.Molecule.Highlight.dispatch(this.plugin.context, this.currentHighLightedDetails.prevQuery);
				}
				//var query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });
				var query = this.Query.sequence(queryData.entity_id.toString(), queryData.struct_asym_id.toString(), { seqNumber: queryData.start_residue_number }, { seqNumber: queryData.end_residue_number });
				this.Command.Molecule.Highlight.dispatch(this.plugin.context, { model: model, query: query, isOn: true });
				this.currentHighLightedDetails = {prevQueryData: queryData, prevQuery: { model: model, query: query, isOn: false }};
			};
			LiteMolComponent.prototype.highlightOff = function() {
				if(typeof this.currentHighLightedDetails !== 'undefined'){
					this.Command.Molecule.Highlight.dispatch(this.plugin.context, this.currentHighLightedDetails.prevQuery);
				}
			};
			LiteMolComponent.prototype.resetThemeSelHighlight = function() {
				this.Command.Visual.ResetTheme.dispatch(this.plugin.context, void 0);
				this.cleanUp();
			};
			LiteMolComponent.prototype.colorChains = function(chainId, colorArr) {
				var visual = this.selectNodes('polymer-visual')[0];
				var model = this.selectNodes('model')[0];
				if (!model || !visual)
					return;
				var colors = new Map();
				colors.set(chainId, this.CoreVis.Color.fromRgb(colorArr[0], colorArr[1], colorArr[2]));
				// etc.
				var theme = this.Visualization.Molecule.createColorMapThemeProvider(
				function (m) { return ({ index: m.atoms.chainIndex, property: m.chains.asymId }); }, colors, 
				// this a fallback color used for elements not in the set 
				this.CoreVis.Color.fromRgb(207,178,178))(model);
				this.Command.Visual.UpdateBasicTheme.dispatch(this.plugin.context, { visual: visual, theme: theme });
			};
			LiteMolComponent.prototype.create = function(target) {
				
				var pluginSpec = this.CustomMenuSpec;
				if(scope.treeMenu == true || scope.treeMenu == 'true'){
					var pluginSpec = this.spec;
				}
				
				if(typeof LiteMolSpecConfig != 'undefined'){
					if(LiteMolSpecConfig.behaviours.length > 0){
						pluginSpec.behaviours = LiteMolSpecConfig.behaviours;
					}
					
					var totalComps = LiteMolSpecConfig.components.length;
					if(totalComps > 0){
						for(var ci = 0; ci < totalComps; ci++){
							pluginSpec.components.push(LiteMolSpecConfig.components[ci]);
						}
					}
				}
				
				//check showlogs flag
				if(typeof scope.showLogs !== 'undefined' && scope.showLogs == 'true'){
					pluginSpec.components.push(this.Plugin.Components.Context.Log(this.LayoutRegion.Bottom, true));
				}
				
				var plugin = new this.Plugin.Instance(pluginSpec, target);
				plugin.context.logger.message("LiteMol Viewer " + this.Plugin.VERSION.number);
				return plugin;
			};
			LiteMolComponent.prototype.getDispatchEventData = function(event) {
				var dispatchData = {}
				var data = event.data;
				if (data && data.residues) {
					dispatchData.residuesName = data.residues[0].authName;
					dispatchData.chainId = data.chains[0].authAsymId;
					dispatchData.residueNumber = data.residues[0].seqNumber;
					dispatchData.entityId = data.chains[0].entity.entityId;
					dispatchData.entryId = data.moleculeId;
				}
				return dispatchData;
			};
			//Method to dispatch custom event
			LiteMolComponent.prototype.dispatchCustomEvent = function(eventType, eventData, eventElement) {
				var dispatchEventElement = element[0];
				if(typeof eventElement !== 'undefined'){
					dispatchEventElement = eventElement;
				}
				if(typeof eventData !== 'undefined'){
					scope.pdbevents[eventType]['eventData'] = eventData;
				}
				dispatchEventElement.dispatchEvent(scope.pdbevents[eventType])
			};
			return LiteMolComponent;
			
		})();
		
		var basicBootstrap = function(){
			//Initialize Plugin
			scope.LiteMolComponent.createPlugin();
			
			//Load Molecule CIF or customQuery and Parse
			scope.LiteMolComponent.loadMolecule();
			
			//Load density
			/*if(typeof scope.loadEdMaps !== 'undefined' && scope.loadEdMaps === 'true'){
				setTimeout(function(){ //Added timeout to let the molecule load first
					scope.LiteMolComponent.loadDensity (false);
				},100);
			}*/
			
			if(typeof scope.validationAnnotation !== 'undefined' && scope.validationAnnotation === 'true' && !scope.treeMenu){
				scope.LiteMolComponent.loadValidationReport();
			}
			
			if(typeof scope.domainAnnotation !== 'undefined' && scope.domainAnnotation === 'true' && !scope.treeMenu){
				scope.LiteMolComponent.loadSequenceAnnotation();
			}
			
		}
		
		
		//Component instance
		scope.LiteMolComponent = new LiteMolComponent();
		
		if(typeof scope.customRender !== 'undefined' || typeof scope.pdbId == 'undefined'){
			//Initialize Plugin
			scope.LiteMolComponent.createPlugin();
		}else{
			basicBootstrap();
		}
		
		//watch pdbid changed
		scope.$watch('pdbId', function(oldVal, newVal) {
			if(typeof scope.pdbId != 'undefined' && oldVal !== newVal){
				scope.LiteMolComponent.moleculeId = scope.pdbId;
				scope.LiteMolComponent.destroyPlugin();
				basicBootstrap();
			}
		});
		
		//bind/listen to other library compoenent events
		if(scope.subscribeEvents == 'true'){
			
			$document.on('PDB.topologyViewer.click', function(e){
				if(typeof e.eventData !== 'undefined'){
					//Abort if entryid and entityid do not match or viewer type is unipdb
					if(e.eventData.entryId != scope.pdbId) return;								
					
					//Create query object from event data					
					var highlightQuery = {
						entity_id: e.eventData.entityId,
						struct_asym_id: e.eventData.structAsymId,
						start_residue_number: e.eventData.residueNumber,
						end_residue_number: e.eventData.residueNumber
					}
					
					//Call highlightAnnotation
					scope.LiteMolComponent.SelectExtractFocus(highlightQuery, {r: 0, g:81, b:51}, false);
				}
			});
			
			var elementTypeArrForRange = ['uniprot', 'pfam', 'cath', 'scop', 'strand', 'helice']
			var elementTypeArrForSingle = ['chain', 'quality', 'quality_outlier', 'binding site', 'alternate conformer']
			$document.on('PDB.seqViewer.click', function(e){
				if(typeof e.eventData !== 'undefined'){
					//Abort if entryid and entityid do not match or viewer type is unipdb
					if(e.eventData.entryId != scope.pdbId) return;
					
					if(typeof e.eventData.elementData !== 'undefined' && elementTypeArrForSingle.indexOf(e.eventData.elementData.elementType) > -1){
						
						//Create query object from event data					
						var highlightQuery = {
							entity_id: e.eventData.entityId,
							struct_asym_id: e.eventData.elementData.pathData.struct_asym_id,
							start_residue_number: e.eventData.residueNumber,
							end_residue_number: e.eventData.residueNumber
						}
						
						//Call highlightAnnotation
						scope.LiteMolComponent.SelectExtractFocus(highlightQuery, {r: 0, g:81, b:51}, false);
					
					}else if(typeof e.eventData.elementData !== 'undefined' && elementTypeArrForRange.indexOf(e.eventData.elementData.elementType) > -1){
						
						var seqColorArray =  e.eventData.elementData.color;
						
						//Create query object from event data					
						var highlightQuery = {
							entity_id: e.eventData.entityId,
							struct_asym_id: e.eventData.elementData.pathData.struct_asym_id,
							start_residue_number: e.eventData.elementData.pathData.start.residue_number,
							end_residue_number: e.eventData.elementData.pathData.end.residue_number
						}
						
						//Call highlightAnnotation
						scope.LiteMolComponent.SelectExtractFocus(highlightQuery, {r: seqColorArray[0], g: seqColorArray[1], b: seqColorArray[2]}, false);
					}
						
				}
			});
			
			$document.on('PDB.seqViewer.mouseover', function(e){
				if(typeof e.eventData !== 'undefined'){
					//Abort if entryid and entityid do not match or viewer type is unipdb
					if(e.eventData.entryId != scope.pdbId) return;
					
					if(typeof e.eventData.elementData !== 'undefined' && elementTypeArrForSingle.indexOf(e.eventData.elementData.elementType) > -1){
						
						//Create query object from event data					
						var highlightQuery = {
							entity_id: e.eventData.entityId,
							struct_asym_id: e.eventData.elementData.pathData.struct_asym_id,
							start_residue_number: e.eventData.residueNumber,
							end_residue_number: e.eventData.residueNumber
						}
						
						//Call highlightAnnotation
						scope.LiteMolComponent.highlightOn(highlightQuery);
						
					}else if(typeof e.eventData.elementData !== 'undefined' && elementTypeArrForRange.indexOf(e.eventData.elementData.elementType) > -1){
						//Residue range
						var startResidue = e.eventData.elementData.pathData.start.residue_number;
						var endResidue = e.eventData.elementData.pathData.end.residue_number;
						
						//Create query object from event data					
						var highlightQuery = {
							entity_id: e.eventData.entityId,
							struct_asym_id: e.eventData.elementData.pathData.struct_asym_id,
							start_residue_number: e.eventData.elementData.pathData.start.residue_number,
							end_residue_number: e.eventData.elementData.pathData.end.residue_number
						}
						
						//Call highlightAnnotation
						scope.LiteMolComponent.highlightOn(highlightQuery);
					}
					
				}
			});
			
			$document.on('PDB.seqViewer.mouseout', function(e){
				//Remove highlight on mouseout
				scope.LiteMolComponent.highlightOff();
			});
			
			$document.on('PDB.topologyViewer.mouseover', function(e){
				if(typeof e.eventData !== 'undefined'){
					//Abort if entryid do not match or viewer type is unipdb
					if(e.eventData.entryId != scope.pdbId) return;
					
					//Create query object from event data					
					var highlightQuery = {
						entity_id: e.eventData.entityId,
						struct_asym_id: e.eventData.structAsymId,
						start_residue_number: e.eventData.residueNumber,
						end_residue_number: e.eventData.residueNumber
					}
					
					//Call highlightAnnotation
					scope.LiteMolComponent.highlightOn(highlightQuery);
					
				}
			});
			
			$document.on('PDB.topologyViewer.mouseout', function(e){
				//Remove highlight
				scope.LiteMolComponent.highlightOff();
			});
			
		}
		
		
	  } //link end here
	}
  }]);
  
}());