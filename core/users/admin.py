from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Company

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Company Access', {'fields': ('companies',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'companies'),
        }),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    filter_horizontal = ('companies', 'groups', 'user_permissions')

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'cnpj')
    search_fields = ('name', 'cnpj')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Company, CompanyAdmin)
