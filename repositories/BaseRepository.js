export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findOne(filter = {}, projection = null, options = {}) {
    return this.model.findOne(filter, projection, options);
  }

  async findById(id, projection = null, options = {}) {
    return this.model.findById(id, projection, options);
  }

  async find(filter = {}, projection = null, options = {}) {
    return this.model.find(filter, projection, options);
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateOne(filter, update, options = {}) {
    return this.model.updateOne(filter, update, options);
  }

  async deleteOne(filter) {
    return this.model.deleteOne(filter);
  }

  async findOneAndDelete(filter) {
    return this.model.findOneAndDelete(filter);
  }

  async save(document) {
    return document.save();
  }
}
