export class Watchers {
  watcher: any;
    constructor(ID: number) { }
    static adapt(item: any): Watchers {
        return new Watchers(
            item.ID
        );
    }
}