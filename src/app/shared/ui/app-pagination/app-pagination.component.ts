import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}

@Component({
  selector: 'app-pagination',
  templateUrl: './app-pagination.component.html',
  styleUrls: ['./app-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPaginationComponent {
  @Input() config!: PaginationConfig;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get startItem(): number {
    if (this.config.totalItems === 0) return 0;
    return (this.config.currentPage - 1) * this.config.pageSize + 1;
  }

  get endItem(): number {
    const end = this.config.currentPage * this.config.pageSize;
    return Math.min(end, this.config.totalItems);
  }

  get pages(): number[] {
    const pages: number[] = [];
    const total = this.config.totalPages;
    const current = this.config.currentPage;
    const maxVisible = 7;

    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current <= 4) {
        // Near the start
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        // Near the end
        pages.push(-1); // Ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.config.totalPages && page !== this.config.currentPage) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this.config.currentPage > 1) {
      this.goToPage(this.config.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.config.currentPage < this.config.totalPages) {
      this.goToPage(this.config.currentPage + 1);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  isEllipsis(page: number): boolean {
    return page === -1;
  }
}

