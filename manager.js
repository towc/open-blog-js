const utils = require( './utils.js' )
    , fs = require( 'fs' )
    , MC = require( 'maptor-consumer' );

module.exports = {
  getTokenIndex( token ) { return this.data.tokens.indexOf( token ) },
  tokenExists( token ) { return this.getTokenIndex( token ) > -1 },
  getAuthorFromToken( token ) { return this.data.authors[ this.getTokenIndex( token ) ] },
  getAuthorFromId( id ) { return this.data.authors[ this.data.authorIds.indexOf( id ) ] },
  getPostFromId( id ) { return this.data.posts[ this.data.postIds.indexOf( id ) ] },
  getAssetFromId( id ) { return this.data.assets[ this.data.assetIds.indexOf( id ) ] },
  getPostIdIndex( id ) { return this.data.postIds.indexOf( id ) },
  postIdExists( id ) { return this.getPostIdIndex( id ) > -1 },

  addPost( opts ) {
    this.data.postIds.push( opts.id );
    this.data.posts.push({
      title: opts.title,
      content: opts.content,
      author: opts.author,
      id: opts.id,
      bannerImageUrl: opts.bannerImageUrl,
      creationTime: Date.now(),
      lastEditTime: Date.now(),
      requests: 0,
    });
    opts.author.posts.push( utils.last( this.data.posts ) );

    return true;
  },
  addAuthor( opts ) {

    utils.timedLog( opts.source + ' created author ' + opts.id );
    this.data.authorIds.push( opts.id );
    this.data.tokens.push( opts.token );
    this.data.authors.push({
      id: opts.id,
      name: opts.name,
      token: opts.token,
      description: opts.description,
      links: opts.links,
      bannerImageUrl: opts.bannerImageUrl,
      profileImageUrl: opts.profileImageUrl,
      privileges: opts.privileges,
      usedAssetStorage: opts.usedAssetStorage,
      source: opts.source,
      posts: [],
      assets: [],
      subsidiaries: [],
      creationTime: Date.now()
    });

    if( opts.source )
      opts.source.subsidiaries.push( utils.last( this.data.authors ) );

    return true;
  },

  saveToFile( path ) {
    
    utils.timedLog( 'starting automatic save' )

    const I = utils.I
        , getId = utils.getId;

    const data = MC.map( this.data, {
      authors: [{
        id: I,
        name: I,
        token: I,
        description: I,
        links: I,
        bannerImageUrl: I,
        profileImageUrl: I,
        privileges: I,
        usedAssetStorage: I,
        source: getId,
        posts: [ getId ],
        assets: [ getId ],
        creationTime: I
      }],
      posts: [{
        id: I,
        title: I,
        published: I,
        content: I,
        lastEditTime: I,
        creationTime: I,
        bannerImageUrl: I,
        requests: I
      }],
      assets: [{
        id: I,
        creationTime: I,
        lastEditTime: I
      }],
      metadata: {
        saveTime: () => Date.now(),
        lastBackupPath: I,
        usedStorage: I,
      },
      settings: I
    });

    fs.writeFile( path, JSON.stringify( data ), 'utf-8' );

    utils.timedLog( 'saved to ' + path );
  },
  loadFromFile( path ) {
    
    fs.readFile( path, 'utf-8', ( err, data ) => {
       
      const pushI = utils.pushI
          , I = utils.I;

      const authorIds = []
          , postIds = []
          , assetIds = []
          , tokens = [];

      this.data = MC.map( JSON.parse( data ), {
        authors: [{
          id: pushI( authorIds ),
          name: I,
          token: pushI( tokens ),
          description: I,
          links: I,
          bannerImageUrl: I,
          profileImageUrl: I,
          privileges: I,
          usedAssetStorage: I,
          source: I,
          posts: I,
          assets: I,
          creationTime: I
        }],
        posts: [{
          id: pushI( postIds ),
          title: I,
          content: I,
          published: I,
          lastEditTime: I,
          creationTime: I,
          bannerImageUrl: I,
          requests: I
        }],
        assets: [{
          id: pushI( assetIds ),
          creationTime: I,
          lastEditTime: I
        }],
        metadata: I,
        settings: I
      });

      this.data.authorIds = authorIds;
      this.data.postIds = postIds;
      this.data.assetIds = assetIds;
      this.data.tokens = tokens;

      this.data.publishedPosts = this.data.posts.slice().filter( ( post ) => post.published );

      this.data.authors.map( ( author ) => {
        author.subsidiaries = [];
        author.source = this.getAuthorFromId( author.source );

        if( author.source )
          author.source.subsidiaries.push( author );

        author.publishedPosts = [];
        author.privatePosts = [];

        author.posts = author.posts.map( ( postId ) => {
          
          const post = this.getPostFromId( postId );

          post.author = author;

          ( post.published ? author.publishedPosts : author.privatePosts ).push( post );

          return post;
        });

        author.assets = author.assets.map( ( assetId ) => {
          
          const asset = this.getAssetFromId( assetId );

          asset.author = author;

          return asset;
        
        });
      });

    });
  }
};
