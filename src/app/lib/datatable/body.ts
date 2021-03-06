import {
  Component, EmbeddedViewRef, forwardRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {DataTable} from './datatable';
import {ColumnComponent} from './columns';

@Component({
  selector: 'm-columnBodyTemplateLoader',
  template: ``
})
export class ColumnBodyTemplateLoader implements OnInit, OnChanges, OnDestroy {

  @Input() column: any;

  @Input() row: any;

  @Input() rowIndex: number;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
    this.view = this.viewContainer.createEmbeddedView(this.column.bodyTemplate, {
      '\$implicit': this.column,
      'row': this.row,
      'rowIndex': this.rowIndex
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(!this.view) {
      return;
    }

    if('rowIndex' in changes) {
      this.view.context.rowIndex = changes['rowIndex'].currentValue;
    }
  }

  ngOnDestroy() {
    this.view.destroy();
  }
}

@Component({
  selector: 'm-rowExpansionLoader',
  template: ``
})
export class RowExpansionLoader implements OnInit, OnDestroy {

  @Input() template: TemplateRef<any>;

  @Input() rowData: any;

  @Input() rowIndex: any;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
    this.view = this.viewContainer.createEmbeddedView(this.template, {
      '\$implicit': this.rowData,
      'rowIndex': this.rowIndex
    });
  }

  ngOnDestroy() {
    this.view.destroy();
  }
}

@Component({
  selector: 'm-emptyTableLoader',
  template: ``
})
export class EmptyTableLoader implements OnInit, OnDestroy {

  @Input() template: TemplateRef<any>;

  view: EmbeddedViewRef<any>;

  constructor(public viewContainer: ViewContainerRef) {}

  ngOnInit() {
    this.view = this.viewContainer.createEmbeddedView(this.template);
  }

  ngOnDestroy() {
    this.view.destroy();
  }
}

@Component({
  selector: '[mTableBody]',
  template: `
    <ng-template ngFor let-row [ngForOf]="value" let-even="even" let-odd="odd" let-rowIndex="index">
      <tr (click)="dt.handleRowClick($event, row, rowIndex)" [ngClass]="[dt.isSelected(row)? 'm-row-selected': '']">
        <td *ngIf="dt.selectionHandler == true">
          <mat-checkbox (click)="dt.selectCheckboxClick($event)" (change)="dt.toggleRowWithCheckbox($event, row)" [checked]="dt.isSelected(row)"></mat-checkbox>
        </td>
        <td #cell [hidden]="col.hidden" *ngFor="let col of columns" [ngClass]="{'m-editable-column':col.editable, 'm-clickable':col.editable}" (click)="dt.switchCellToEditMode(cell,col,row)">
          <span class="m-cell-data" *ngIf="!col.bodyTemplate" [ngClass]="{'m-clickable':col.editable}">{{row[col.field]}}</span>
          <span class="m-cell-data" *ngIf="col.bodyTemplate">
            <m-columnBodyTemplateLoader [column]="col" [row]="row" [rowIndex]="rowIndex"></m-columnBodyTemplateLoader>
          </span>
          <div class="m-cell-editor" (click)="$event.stopPropagation()" *ngIf="col.editable">
            <mat-card matInput class="m-input-card" *ngIf="!col.editorTemplate">
              <mat-form-field [floatPlaceholder]="'never'" class="m-input-form">
                <input matInput placeholder="{{col.header}}" [(ngModel)]="row[col.field]" (change)="dt.onCellEditorChange($event, col, row, rowIndex)"
                       (keydown)="dt.onCellEditorKeydown($event, col, row, rowIndex)" (blur)="dt.onCellEditorBlur($event, col, row, rowIndex)"
                       (input)="dt.onCellEditorInput($event, col, row, rowIndex)">
              </mat-form-field>
            </mat-card>
            <m-columnEditorTemplateLoader *ngIf="col.editorTemplate" (click)="$event.stopPropagation()" [column]="col" [row]="row" [rowIndex]="rowIndex"></m-columnEditorTemplateLoader>
          </div>
        </td>
        <td *ngIf="dt.expandable == true" style="padding-left: 0px;">
          <span class="m-expand-icon material-icons" (click)="dt.toggleRow(row, $event)">
            <i class="material-icons m-clickable" *ngIf="!dt.isRowExpanded(row)">keyboard_arrow_right</i>
            <i class="material-icons m-clickable" *ngIf="dt.isRowExpanded(row)">keyboard_arrow_down</i>
          </span>
        </td>
      </tr>
      <tr *ngIf="dt.expandable && dt.isRowExpanded(row)" class="m-expanded-row-content">
        <td [attr.colspan]="dt.totalColumns()">
          <m-rowExpansionLoader [rowData]="row" [rowIndex]="rowIndex" [template]="dt.expansionTemplate"></m-rowExpansionLoader>
        </td>
      </tr>
    </ng-template>

    <tr *ngIf="dt.isEmpty()" class="m-empty-row">
      <td [attr.colspan]="dt.totalColumns()">
        <m-emptyTableLoader [template]="dt.emptyTableTemplate"></m-emptyTableLoader>
      </td>
    </tr>
  `,
  styles: [`
    td{
      position: relative;
    }
    tr {
      border-top: 1px solid #e0e0e0;
      height: 47px;
      transition: all 0.2s;
    }
    tr:hover{
      background: #EEEEEE;
    }
    td:not(:first-child){
      padding: 0px 28px;
    }
    td:first-child{
      padding-left: 24px;
    }
    td:last-child{
      padding-right: 24px;
    }
    .m-row-selected{
      background: #EEEEEE;
    }
    .m-expand-icon{
      font-size: 12px;
      vertical-align: middle;
      cursor: pointer;
      color: #757575;
    }
    .m-input-card{
      background: #f7f7f7;
      padding: 0px 0px !important;
      top: 0px !important;
    }
    .m-input-form{
      width: 150px;
      padding: 0px 12px;
    }
    .m-cell-editor{
      position: absolute !important;
      z-index: 1000 !important;
      top: 0 !important;
    }
    .m-editable-column > .m-cell-editor {
      display: none;
    }
    .m-editable-column.m-cell-editing > .m-cell-editor {
      display: block;
    }
    .m-editable-column.m-cell-editing > .m-cell-data {
      visibility: hidden;
    }
  `]
})
export class TableBodyComponent {
  constructor(@Inject(forwardRef(() => DataTable)) public dt: DataTable) { };
  @Input('mTableBody') columns: ColumnComponent[];
  @Input() value;
}
