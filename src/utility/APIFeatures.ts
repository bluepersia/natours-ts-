import { Query } from "mongoose";

export default class APIFeatures 
{
    constructor (public reqQuery:{[key:string]:any}, public query:Query<any,any>){}

    filter ()
    {
        let filter = {...this.reqQuery};
        ['sort', 'fields', 'page', 'limit'].forEach (el => delete filter[el]);

        let filterStr = JSON.stringify (filter);
        filterStr = filterStr.replace (/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);

        filter = JSON.parse (filterStr);

        this.query.find (filter);
    }


    sort ()
    {
        this.query.sort (this.reqQuery.sort?.split (',').join(' ') || '-createdAt');
    }

    select ()
    {
        this.query.select (this.reqQuery.select?.split (',').join(' ') || '-__v0')
    }

    paginate ()
    {
        const page:number = this.reqQuery.page || 1;
        const limit:number = this.reqQuery.limit || 100;
        const skip:number = (page - 1) * limit;

        this.query.skip (skip).limit (limit);
    }


    all ()
    {
        this.filter ();
        this.sort ();
        this.select ();
        this.paginate ();
    }
}