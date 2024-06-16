# Generated by Django 5.0.6 on 2024-06-11 18:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oglasnik', '0003_favorit'),
    ]

    operations = [
        migrations.CreateModel(
            name='OglasView',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('oglas', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='oglasnik.oglas')),
            ],
            options={
                'unique_together': {('oglas', 'ip_address')},
            },
        ),
    ]