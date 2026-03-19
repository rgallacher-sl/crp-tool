import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dev-seed-override',
  standalone: true,
  template: '',
})
export class DevSeedOverrideComponent implements OnInit {
  constructor(
    private assessmentService: AssessmentService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isSignedIn()) {
      this.auth.signIn('user@crptool.com', 'password123');
    }
    const assessment = this.assessmentService.seedOverrideExample();
    this.router.navigate(['/assessments', assessment.id]);
  }
}
