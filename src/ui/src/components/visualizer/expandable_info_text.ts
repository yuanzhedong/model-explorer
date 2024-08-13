/**
 * @license
 * Copyright 2024 The Model Explorer Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==============================================================================
 */

import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AppService} from './app_service';

/** Expandable info text component. */
@Component({
  selector: 'expandable-info-text',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './expandable_info_text.ng.html',
  styleUrls: ['./expandable_info_text.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableInfoText implements AfterViewInit, OnDestroy, OnChanges {
  @Input() text = '';
  @Input() type = '';
  @Input() bgColor = 'transparent';
  @Input() textColor = 'inherit';
  @ViewChild('container') container?: ElementRef<HTMLElement>;
  @ViewChild('oneLineText') oneLineText?: ElementRef<HTMLElement>;

  expanded = false;

  private hasOverflowInternal = false;
  private resizeObserver?: ResizeObserver;

  constructor(
    private readonly appService: AppService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  @HostBinding('class.expanded') get hostExpanded() {
    return this.expanded;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateHasOverflow();
      this.changeDetectorRef.markForCheck();
    });

    if (this.container) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateHasOverflow();
        this.changeDetectorRef.markForCheck();
      });
      this.resizeObserver.observe(this.container.nativeElement);
    }
  }

  ngOnChanges() {
    setTimeout(() => {
      this.updateHasOverflow();
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  handleToggleExpand(event: MouseEvent, fromExpandedText = false) {
    if (!this.hasOverflow && !this.hasMultipleLines) {
      return;
    }

    event.stopPropagation();

    // Don't allow clicking on the expanded text to collapse it because users
    // might want to copy the content.
    if (fromExpandedText && this.expanded) {
      return;
    }
    this.expanded = !this.expanded;
  }

  getMaxConstValueCount(): number {
    return this.appService.config()?.maxConstValueCount ?? 0;
  }

  get hasOverflow(): boolean {
    this.updateHasOverflow();
    return this.hasOverflowInternal;
  }

  get hasMultipleLines(): boolean {
    return this.type !== 'namespace' && this.text.includes('\n');
  }

  get iconName(): string {
    return this.expanded ? 'unfold_less' : 'unfold_more';
  }

  get hasBgColor(): boolean {
    return this.bgColor !== 'transparent';
  }

  get namespaceComponents(): string[] {
    const components = this.text.split('/');
    if (this.text !== '<root>') {
      components.unshift('<root>');
    }
    return components;
  }

  get formatQuantization(): string {
    const parts = this.text
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map((value) => value.trim());
    return parts.join('\n');
  }

  private updateHasOverflow() {
    if (!this.oneLineText) {
      this.hasOverflowInternal = false;
      return;
    }

    this.hasOverflowInternal =
      this.oneLineText.nativeElement.scrollWidth >
      this.oneLineText.nativeElement.offsetWidth;
    if (
      this.expanded &&
      (this.type === 'namespace' || this.type === 'values')
    ) {
      this.hasOverflowInternal = true;
    }
  }
}
