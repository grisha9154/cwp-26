class crudService {
    constructor(repository) {
        this.repository = repository;
    }

    readConfig = ({limit, page}) =>{

        const readLimit = (limit < 0 || limit > 20) ? 10 : limit;
        const readPage = (page < 1) ? 1 : page;
        const offset = readLimit * readPage - 1;

        return {
            limit: readLimit,
            offset
        }

    };

    async readAll({limit, page}) {
       const config = this.readConfig({limit, page});

        return await this.repository.findAll({
            ...config,
            raw: true
        })
    }

    async read(id) {
        return await this.repository.findById(id, { raw: true });
    }

    async create(item) {
        return await this.repository.create(item);
    }

    async delete(id) {
        return await this.repository.destroy({
            where: {
                id
            }
        })
    }

    async update(id, item) {
        return await this.repository.update(item, {
            where: {
                id
            }
        })
    }
}

module.exports = crudService;