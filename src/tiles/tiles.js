class tile {
  constructor (options) {
    this.scene = options.scene;
    this.common = this.scene.sys.game.common;

    this.draw = false;
    this.flipTile = false;

    this.tileId = options.tileId;
    this.cell = options.cell || undefined;
    this.depth = this.cell.depth || 0;
    this.x = options.x || this.cell.position.bottom.x || 0;
    this.y = options.y || this.cell.position.bottom.y || 0;
    this.type = options.type || 'terrain';
    this.offset = options.offset || 0;
    this.sprite = options.sprite || undefined;

    if (!this.checkTile())
      return;

    if (!this.getTile())
      return;

    this.draw = true;
  }

  getTile () {
    if (!this.common.tiles[this.tileId])
      return false;

    this.tile = this.common.tiles[this.tileId];

    return true;
  }

  checkTile () {
    if (this.cell == undefined && this.tileId == 0)
      return false;

    return true;
  }

  calculatePosition () {
    if ((this.cell.getProperty('waterLevel') == 'submerged' || this.cell.getProperty('waterLevel') == 'shore') && this.cell.z < this.scene.city.waterLevel)
      this.offset = ((this.scene.city.waterLevel - this.cell.z) * this.common.layerOffset);

    if (!this.cell && !this.tile) throw 'Cannot set position for cell '+this.x+', '+this.y+'; references to cell and tile are not defined';

    this.x = this.cell.position.bottom.x - (this.tile.width / 2) << 0;
    this.y = this.cell.position.bottom.y - (this.tile.height) - this.offset << 0;

    this.depth = this.cell.depth || 0;
  }

  setVisible (bool) {
    this.sprite.setVisible(bool);
  }
 
  rotation () {
    let rotation = this.scene.city.rotation;

    this.tileId = this.tile.rotate[rotation];
    this.getTile();
  }

  flip () {
    if (!this.tile.flip)
      return false;
    
    if (this.scene.city.cityRotation == 1 || this.scene.city.cityRotation == 3)
      return this.cell.properties.rotate ? false : true;
    else
      return this.cell.properties.rotate;
  }

  create () {
    if (!this.draw)
      return;

    this.cell.addTile(this);
    this.calculatePosition();

    if (this.tile.animated)
      this.sprite = this.scene.add.sprite(this.x, this.y, this.common.tilemap).play(this.tile.imageName);
    else
      this.sprite = this.scene.add.sprite(this.x, this.y, this.common.tilemap, this.tile.textures[0]);

    this.sprite.cell = this.cell;
    this.sprite.setScale(this.common.scale);
    this.sprite.setOrigin(0, 0);
    this.sprite.setDepth(this.depth);
    
    this.cell.addSprite(this.sprite);
  }

  drawOutline (gfx, type = 'outline') {
    let polygon;

    if (type == 'hitbox')
      polygon = this.tile.hitbox;
    else
      polygon = this.tile.outline;

    gfx.lineStyle(2, 0x00AA00);
    gfx.beginPath();
    gfx.moveTo(polygon.points[0].x, polygon.points[0].y);
    
    for (let i = 1; i < polygon.points.length; i++)
      gfx.lineTo(polygon.points[i].x, polygon.points[i].y);

    gfx.closePath();
    gfx.strokePath();
  }
}

export default tile;