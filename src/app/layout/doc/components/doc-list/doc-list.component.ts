import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocsService } from '../../services/docs.service';

@Component({
    selector: 'app-doc-list',
    templateUrl: './doc-list.component.html',
    styleUrls: ['./doc-list.component.scss']
})
export class DocListComponent implements OnInit {
    docs$ = this.docsService.docs$;

    constructor(
        private docsService: DocsService,
        private router: Router
    ) { }

    ngOnInit(): void { }

    onCreateNewDoc(): void {
        // Create a new document with default values
        this.docsService.createDoc({
            title: 'Untitled',
            blocks: []
        }).subscribe(newDoc => {
            // Navigate to the new document editor
            this.router.navigate(['/docs', newDoc.id]);
        });
    }
}
