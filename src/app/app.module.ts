import { TUI_SANITIZER, TuiAlertModule, TuiButtonModule, TuiDialogModule, TuiRootModule } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { TUI_LANGUAGE, TUI_RUSSIAN_LANGUAGE } from '@taiga-ui/i18n';
import { of } from "rxjs";
import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from "@angular/common";
import { SubmitComponent } from './shared/components/submit/submit.component';
import { JwtInterceptor } from "./shared/interceptors/jwt.interceptor";
import { ErrorInterceptor } from "./shared/interceptors/error.interceptor";
import { HttpControlInterceptor } from "./shared/interceptors/http-control.interceptor";

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    SubmitComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TuiRootModule,
    TuiAlertModule,
    TuiDialogModule,
    TuiButtonModule,
  ],
  providers: [
    {
      provide: TUI_SANITIZER,
      useClass: NgDompurifySanitizer,
    },
    {
      provide: TUI_LANGUAGE,
      useValue: of(TUI_RUSSIAN_LANGUAGE),
    },
    {
      provide: LOCALE_ID,
      useValue: 'ru'
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpControlInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
