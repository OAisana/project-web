import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommentService } from "../comment.service";

@Component({
  selector: "app-comment-form",
  templateUrl: "./comment-form.component.html",
  styleUrls: ["./comment-form.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CommentFormComponent {
  @Input() recipeId!: number;
  @Output() commentAdded = new EventEmitter<void>();

  commentContent = "";
  isSubmitting = false;
  errorMessage = "";

  constructor(private commentService: CommentService) {}

  submitComment(): void {
    if (!this.commentContent.trim()) {
      this.errorMessage = "Comment cannot be empty";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    this.commentService
      .addComment(this.recipeId, this.commentContent)
      .subscribe({
        next: () => {
          this.commentContent = "";
          this.isSubmitting = false;
          this.commentAdded.emit();
        },
        error: (error) => {
          this.errorMessage = "Failed to add comment. Please try again.";
          this.isSubmitting = false;
          console.error("Error adding comment:", error);
        },
      });
  }

  cancelComment(): void {
    this.commentContent = "";
    this.commentAdded.emit();
  }
}
