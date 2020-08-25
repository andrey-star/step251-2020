import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './dataSubmissionForm.html',
  styleUrls: ['./dataSubmissionForm.css'],
})
export class DataSubmissionFormComponent implements OnInit {
  dataForm;

  constructor(private formBuilder: FormBuilder) {
    this.dataForm = this.formBuilder.group({data: ''});
  }

  ngOnInit(): void {}

  onSubmit(data): void {
    window.localStorage.setItem('data', data);
    this.dataForm.reset();
    console.log('Data saved!', data);
  }
}
