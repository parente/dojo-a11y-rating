// this would be in file api or some such
var library = {books : [
  {
    name : 'See Spot Run!',
    id : 'see-spot-run',
    description : 'A classic story about Spot, Dick, and Jane',
    language : 'en-us'
  },
  {
    name : 'Back in Time',
    id : 'back-in-time',
    description : 'Choose your path through this time traveling epic',
    language : 'en-us'
  },
  {
    name : 'A Christmas Story',
    id : 'sample',
    description : "Charles Dickens classic story of Scrooge's redemption",
    language : 'en-us'
  }
]};
var renderedLibrary = false;

// want to use file api assuming dl'ed before; for now
// just look up in local js object
var fetchBook = function(bid) {
  return $.get(encodeURI('books/'+bid+'/book.json'));
};

var renderBook = function(node, loc, bookData) {
  // always make sure the header is up to date
  var header = node.children(":jqmData(role=header)");
  header.find('h1').html(bookData.cover.title);

  // remove old content
  var contentNode = node.find('.book-content');
  contentNode.empty();

  if(!loc.args.pid) {
    // cover layout
    $('#coverTemplate')
      .tmpl({
        cover : bookData.cover,
        loc : loc
      })
      .appendTo(contentNode);
  } else {
    // find page info
    var page = $.grep(bookData.pages, function(page) {
      return page.id === loc.args.pid;
    });
    // page layout
    $('#pageTemplate')
      .tmpl({
        page : page[0],
        loc : loc
      })
      .appendTo(contentNode);
  }
  // enhance the page
  node.page();
  // enhance any listviews
  node.find('[data-role="listview"]').listview();
};

var decodeHash = function(hash) {
  var o = {}, tmp, nv;
  tmp = hash.substring(1).split('?');
  o.cmd = tmp[0];
  o.args = {};
  tmp = tmp[1].split('&');
  for(var i=0, l=tmp.length; i<l; i++) {
    nv = tmp[i].split('=');
    o.args[nv[0]] = nv[1];
  }
  return o;
};

var xhr;
var buffer = 0;
$(document).bind("pagebeforechange", function(e, data) {
  // @todo: want to do this just before list is needed, but
  // hitting render bugs; do first for now
  if(!renderedLibrary) {
    $('#libraryTemplate')
      .tmpl(library)
      .appendTo('#library-list');
      renderedLibrary = true;
    // $('#library-list').listview('refresh');
  }

  if(typeof data.toPage === 'string') {
    var u = $.mobile.path.parseUrl(data.toPage);
    if(u.hash.search(/^#book/) === 0) {
      // stop the event no matter what
      e.preventDefault();

      // set original url in options
      data.options.dataUrl = u.href;
      //data.options.allowSamePageTransition = true;
      // data.options.transition = 'fade';
      // console.log(data.options);

      // fetch info about the book and page
      var loc = decodeHash(u.hash);

      // cancel any previous request
      if(xhr) {
        xhr.abort();
        xhr = null;
      }

      // @todo: avoid reloading current book
      // @todo: all manner of timing issues here; cleanup later
      $.mobile.showPageLoadingMsg();
      xhr = fetchBook(loc.args.bid).success(function(bookData) {
        buffer = (buffer+1) % 2;
        var node = $('#book'+buffer);
        var bookData = JSON.parse(bookData);
        renderBook(node, loc, bookData);
        $.mobile.changePage(node, data.options);
      }).error(function(e) {
        // @todo: get the std page load error to popup
        console.error('failed to load book');
        console.error(e);
      }).complete($.mobile.hidePageLoadingMsg);
    }
  }
});

// $(document).bind('pagechange', function(e, data) {
//   console.log(e, data);
// });
