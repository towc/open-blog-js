module.exports = {
  getMissing: ( items, batch ) => items.filter( ( x ) => !batch[ x ] ),
  last: ( array ) => array[ array.length - 1 ],
  I: ( item ) => item,
  getId: ( item ) => item && item.id,
  pushI: ( array ) => ( ( item ) => { array.push( item ); return item } ),

  timedLog: ( message ) => console.log( new Date() + ' > ' + message )
};

