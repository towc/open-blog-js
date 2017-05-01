const utils = require( './utils.js' )
    , manager = require( './manager.js' );

const ITEM_PROVIDED = ' not provided'
    , AUTHOR_MATCHING_TOKEN = 'no author matching the token has been found'
    , AUTHOR_CREATE_PERMISSION = 'author can\'t create '
    , POST_CONTENT_SIZE = 'post content can\'t exceed 50000 characters'
    , POST_TITLE_SIZE = 'post title can\'t exceed than 200 characters'
    , _ID_USE = ' id already in use'
    , INTERNAL_ERROR = 'internal error'
    , AUTHOR_LEVEL = 'author level can\'t be lower than source author'
    , AUTHOR_NAME_SIZE = 'author name can\'t exceed 80 characters'
    , AUTHOR_TOKEN_EXISTANT = 'author token already in use'
    , AUTHOR_DESC_SIZE = 'author description can\'t exceed 400 characters'
    , AUTHOR_LINK_AMOUNT = 'author link amount can\'t exceed 8'
    , AUTHOR_LINK_FORMAT = 'author links are in the wrong format'
    , AUTHOR_LINK_SIZE = 'each author link can\'t exceed 100 characters'
    , AUTHOR_LINK_DISPLAY_SIZE = 'each author link display can\'t exceed 30 characters';

module.exports = {
  consumeNewPost( reqBody, returnValue ) {
    
    const missing = utils.getMissing( [ 'id', 'title', 'content', 'token'  ], reqBody );

    if( missing.length > 0 )
      return missing[ 0 ] + ITEM_PROVIDED;

    if( !manager.tokenExists( reqBody.token ) )
      return AUTHOR_MATCHING_TOKEN;

    const author = manager.getAuthorFromToken( reqBody.token );
    if( !author.privileges.createPost )
      return AUTHOR_CREATE_PERMISSION + 'posts';

    if( reqBody.content.length > 50000 )
      return POST_CONTENT_SIZE;

    if( reqBody.title.length > 200 )
      return POST_TITLE_SIZE;

    if( manager.postIdExists( reqBody.id ) )
      return 'post' + _ID_USE;

    const success = manager.addPost({
      id: reqBody.id,
      title: reqBody.title,
      content: reqBody.content,
      author: author,
      published: reqBody.published,
      bannerImageUrl: reqBody.bannerImageUrl || '/asset/default-post-banner.png'
    });

    if( !success )
      return INTERNAL_ERROR;

    return false;

  },
  consumeNewAuthor( reqBody, returnValue ) {
    
    const missing = utils.getMissing( [ 'id', 'name', 'token', 'authorToken' ], reqBody );

    if( missing.length > 0 )
      return missing[ 0 ] + ITEM_PROVIDED;

    if( !manager.tokenExists( reqBody.token ) )
      return AUTHOR_MATCHING_TOKEN;

    const author = manager.getAuthorFromToken( reqBody.token );
    if( !author.privileges.createAuthor)
      return AUTHOR_CREATE_PERMISSION + 'author';

    const level = Math.abs( parseInt( reqBody.level ) ) || Infinity;
    if( author.level > level )
      return AUTHOR_LEVEL;

    if( reqBody.name > 80 )
      return AUTHOR_NAME_SIZE;

    if( manager.tokenExists( reqBody.authorToken ) )
      return AUTHOR_TOKEN_EXISTANT;

    if( reqBody.description && reqBody.description.length > 400 )
      return AUTHOR_DESC_SIZE;
  
    if( reqBody.links ) {
      if( reqBody.links.length > 8 )
        return AUTHOR_LINK_AMOUNT;

      for( var i = 0; i < reqBody.links.length; ++i ) {
        var link = reqBody.links[ i ];
        
        if( !( typeof link.link === 'string' && typeof link.display === 'string' ) )
          return AUTHOR_LINK_FORMAT;

        if( link.link.length > 100 )
          return AUTHOR_LINK_SIZE;

        if( link.display.length > 30 )
          return AUTHOR_LINK_DISPLAY_SIZE;
      } 
    }

    const privileges = reqBody.privileges || {};

    const success = manager.addAuthor({
      id: reqBody.id,
      name: reqBody.name,
      token: reqBody.authorToken,
      description: reqBody.description || '',
      links: reqBody.links || [],
      bannerImageUrl: reqBody.bannerImageUrl || '/asset/default-banner.png',
      profileImageUrl: reqBody.profileImageUrl || '/asset/default-profile.png',
      privileges: {
        createPost:   privileges.hasOwnProperty( 'createPost' )   ? !!privileges.createPost     : true,
        createAuthor: privileges.hasOwnProperty( 'createAuthor' ) ? !!privileges.createAuthor   : false,
        createAsset:  privileges.hasOwnProperty( 'createAsset' )  ? !!privileges.createAsset    : false,
        deletePost:   privileges.hasOwnProperty( 'deletePost' )   ? !!privileges.deletePost     : true,
        deleteAuthor: privileges.hasOwnProperty( 'deleteAuthor' ) ? !!privileges.deleteAuthor   : false,
        deleteAsset:  privileges.hasOwnProperty( 'deleteAsset' )  ? !!privileges.deleteAsset    : false,
        editPost:     privileges.hasOwnProperty( 'editPost' )     ? !!privileges.editPost       : true,
        editAuthor:   privileges.hasOwnProperty( 'editAuthor' )   ? !!privileges.editAuthor     : false,
        editAsset:    privileges.hasOwnProperty( 'editAsset' )    ? !!privileges.editAsset      : false,
        assetStorage: privileges.hasOwnProperty( 'assetStorage' )    ? +privileges.assetStorage : Math.pow( 1024, 3 ), // 1GB
        level: level
      },
      usedAssetStorage: 0,
      source: author
    });

    if( !success )
      return INTERNAL_ERROR;
  },
  consumeNewAsset( reqBody, retValue ) {
   // TODO 

  }
}

