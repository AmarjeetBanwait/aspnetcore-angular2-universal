
import { Input, Directive, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { Store, StoreModule } from '@ngrx/store';
// for AoT we need to manually split universal packages (/browser & /node)
import { UniversalModule, isBrowser, isNode } from 'angular2-universal/node';

import { IMPORTS, COMPONENTS, PROVIDERS, PIPES } from '../app.module';
import { AppComponent } from 'app';
// Universal : XHR Cache 
import { CacheService, StorageService, ServerStorage } from 'app-shared';

export function getRequest() {
  return Zone.current.get('req') || {};
}
export function getResponse() {
  return Zone.current.get('res') || {};
}

/* tslint:disable */
@Directive({selector: '[dragula]'})
export class DragulaDirective {
    @Input() public dragula: string;
    @Input() public dragulaModel: any;
    @Input() public dragulaOptions: any;

    constructor() {
       console.log('\n\n\n\n\n', 'DRAGULA DIRECTIVE --------- ???????????????????', '\n\n\n\n\n\n');
    }
 }
/* tslint:enable */

@NgModule({
    declarations : [
        ...COMPONENTS,
        ...PIPES,

        DragulaDirective
    ],
    bootstrap: [ AppComponent ],
    imports: [
        // "UniversalModule" Must be first import.
        // ** NOTE ** : This automatically imports BrowserModule, HttpModule, and JsonpModule for Browser,
        // and NodeModule, NodeHttpModule etc for the server.
        UniversalModule,

        ...IMPORTS
    ],
    providers: [
        // Angular -Universal- providers below ::
        // Use them as found in the example in /containers/home.component using for example:
        //     ` @Inject('isBrowser') private isBrowser: boolean ` in your constructor
        { provide: 'isBrowser', useValue: isBrowser }, 
        { provide: 'isNode', useValue: isNode },

        { provide: 'req', useFactory: getRequest },
        { provide: 'res', useFactory: getResponse },

        // We're using Dependency Injection here to use a Server/Node specific "Storage" through the empty shell class StorageService
        { provide: StorageService, useClass: ServerStorage },

        ...PROVIDERS
        

        // Other providers you want to add that you don't want shared in "Common" but are browser only
    ]
})

export class AppServerModule {

    constructor(public cache: CacheService) { }

    /** Universal Cache "hook"
     * We need to use the arrow function here to bind the context as this is a gotcha
     * in Universal for now until it's fixed
     */
    universalDoDehydrate = (universalCache) => {
        console.log('universalDoDehydrate ****');
        universalCache[CacheService.KEY] = JSON.stringify(this.cache.dehydrate());
    }

    /** Universal Cache "hook"
     * Clear the cache after it's rendered
     */
    universalAfterDehydrate = () => {
        this.cache.clear();
    }
}
