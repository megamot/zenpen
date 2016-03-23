// editor
ZenPen = window.ZenPen || {};
ZenPen.editor = (function() {

	// Editor elements
	var contentField, lastType, currentNodeList;

	// Editor Bubble elements
	var textOptions;

	var composing;

	function init() {

		composing = false;
		bindElements();

		// Set cursor position
		var range = document.createRange();
		var selection = window.getSelection();

		selection.removeAllRanges();
		selection.addRange(range);

		createEventBindings();

		// Load state if storage is supported
		if ( ZenPen.util.supportsHtmlStorage() ) {
			loadState();
		}
	}

	function createEventBindings() {

		// Key up bindings
		if ( ZenPen.util.supportsHtmlStorage() ) {

			document.onkeyup = function( event ) {
				checkTextHighlighting( event );
				saveState();
			}

		} else {
			document.onkeyup = checkTextHighlighting;
		}


		// Window bindings
		window.addEventListener( 'resize', function( event ) {
			updateBubblePosition();
		});


		document.body.addEventListener( 'scroll', function() {

			// TODO: Debounce update bubble position to stop excessive redraws
			updateBubblePosition();
		});

		// Composition bindings. We need them to distinguish
		// IME composition from text selection
		document.addEventListener( 'compositionstart', onCompositionStart );
		document.addEventListener( 'compositionend', onCompositionEnd );
	}


	function bindElements() {


		contentField = document.querySelector( '.content' );


	}

	function checkTextHighlighting( event ) {

		var selection = window.getSelection();


		// Check selections exist
		if ( selection.isCollapsed === true && lastType === false ) {

			onSelectorBlur();
		}

		// Text is selected
		if ( selection.isCollapsed === false && composing === false ) {

			currentNodeList = findNodes( selection.focusNode );

			// Find if highlighting is in the editable area
			if ( hasNode( currentNodeList, "ARTICLE") ) {
				updateBubbleStates();
				updateBubblePosition();


			}
		}

		lastType = selection.isCollapsed;
	}
	
	function updateBubblePosition() {
		var selection = window.getSelection();
		var range = selection.getRangeAt(0);
		var boundary = range.getBoundingClientRect();
		
		textOptions.style.top = boundary.top - 5 + window.pageYOffset + "px";
		textOptions.style.left = (boundary.left + boundary.right)/2 + "px";
	}

	function updateBubbleStates() {

		// It would be possible to use classList here, but I feel that the
		// browser support isn't quite there, and this functionality doesn't
		// warrent a shim.

		if ( hasNode( currentNodeList, 'B') ) {
			boldButton.className = "bold active"
		} else {
			boldButton.className = "bold"
		}

		if ( hasNode( currentNodeList, 'I') ) {
			italicButton.className = "italic active"
		} else {
			italicButton.className = "italic"
		}

		if ( hasNode( currentNodeList, 'BLOCKQUOTE') ) {
			quoteButton.className = "quote active"
		} else {
			quoteButton.className = "quote"
		}

		if ( hasNode( currentNodeList, 'A') ) {
			urlButton.className = "url useicons active"
		} else {
			urlButton.className = "url useicons"
		}
	}


	function findNodes( element ) {

		var nodeNames = {};


		while ( element.parentNode ) {

			nodeNames[element.nodeName] = true;
			element = element.parentNode;

			if ( element.nodeName === 'A' ) {
				nodeNames.url = element.href;
			}
		}

		return nodeNames;
	}

	function hasNode( nodeList, name ) {

		return !!nodeList[ name ];
	}

	function saveState( event ) {
		

		localStorage[ 'content' ] = contentField.innerHTML;
	}

	function loadState() {



		if ( localStorage[ 'content' ] ) {
			contentField.innerHTML = localStorage[ 'content' ];
		}
	}


	function onCompositionStart ( event ) {
		composing = true;
	}

	function onCompositionEnd (event) {
		composing = false;
	}

	return {
		init: init,
		saveState: saveState
	}

})();