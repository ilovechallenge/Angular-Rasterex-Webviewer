import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
    transform(value: any, length: number = 2, ...args: any[]) {
        if (!value || value.length <= 5 ) return value;
        const firstChars = value.substring(0, length);
        const lastChars = value.substring(value.length - length);
        return `${firstChars}...${lastChars}`
    }
}