using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AcademicAppoinment.Migrations
{
    /// <inheritdoc />
    public partial class AddAppointmentAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentName",
                table: "Appointments",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentUrl",
                table: "Appointments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentName",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AttachmentUrl",
                table: "Appointments");
        }
    }
}
