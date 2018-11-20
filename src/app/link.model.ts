export class Link {

  id: string = null;
  title: string = null;
  description: string = null;

  constructor(link: any) {
    this.id = link.id;
    this.title = link.title;
    this.description = link.description;
  }

}
