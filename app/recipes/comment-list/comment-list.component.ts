import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Comment } from "../comment.model";
import { CommentService } from "../comment.service";

@Component({
  selector: "app-comment-list",
  templateUrl: "./comment-list.component.html",
  styleUrls: ["./comment-list.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class CommentListComponent implements OnInit {
  @Input() recipeId!: number;
  comments: Comment[] = [];
  isLoading = false;
  errorMessage = "";

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    if (!this.recipeId) return;

    this.isLoading = true;
    this.errorMessage = "";

    this.commentService.getComments(this.recipeId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = "Failed to load comments. Please try again.";
        this.isLoading = false;
        console.error("Error loading comments:", error);
      },
    });
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  }
}
