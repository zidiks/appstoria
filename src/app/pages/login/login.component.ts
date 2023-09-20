import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";
import { AuthService } from "../../shared/services/auth.service";
import { of, take } from "rxjs";
import { TUI_PASSWORD_TEXTS, TUI_VALIDATION_ERRORS } from "@taiga-ui/kit";
import { Roles } from "../../shared/enums/roles.enum";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: `Пустое поле!`,
      },
    },
    {
      provide: TUI_PASSWORD_TEXTS,
      useValue: of([``]),
    },
  ],
})
export class LoginComponent {
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    login : [ null, Validators.required ],
    password : [ null, Validators.required ],
  } );

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private authService: AuthService,
  ) { }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  public onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.authService.login(this.f['login'].value, this.f['password'].value)
        .pipe(take(1))
        .subscribe(
          (res) => {
            if (res && !res.roles.includes(Roles.User)) {
              this.alertService.open('Недостаточно прав доступа', {label: `Невозможно войти`, status: TuiNotification.Error, autoClose: 7000}).subscribe();
              this.loading = false;
            }
            this.router.navigate(['/']);
          },
          (error) => {
            this.alertService.open(error.message, {label: `Невозможно войти`, status: TuiNotification.Error, autoClose: 7000}).subscribe();
            this.loading = false;
          });
    }, 1500);
  }
}
