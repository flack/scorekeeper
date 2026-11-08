import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { Timestamp } from './storage.service';

/** "Today at 2:30 PM", "Last Monday at 8:15 PM", "11/02/2026" */
@Pipe({ name: 'calendar' })
export class CalendarPipe implements PipeTransform {
    transform(value: Timestamp | undefined): string {
        return value ? moment(value).calendar() : '';
    }
}

/**
 * "a few seconds ago", "an hour ago". Pure pipe, so pass a changing second
 * argument (e.g. the current time) to have the text refreshed
 */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
    transform(value: Timestamp | undefined, _now?: number): string {
        return value ? moment(value).fromNow() : '';
    }
}
