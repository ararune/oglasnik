# Generated by Django 5.0.6 on 2024-06-27 20:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oglasnik', '0012_komentar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='komentar',
            name='tekst',
            field=models.CharField(max_length=150),
        ),
    ]
