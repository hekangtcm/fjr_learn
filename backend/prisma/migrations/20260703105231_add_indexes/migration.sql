-- CreateIndex
CREATE INDEX "books_user_id_status_idx" ON "books"("user_id", "status");

-- CreateIndex
CREATE INDEX "books_user_id_created_at_idx" ON "books"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "books_user_id_category_id_idx" ON "books"("user_id", "category_id");
