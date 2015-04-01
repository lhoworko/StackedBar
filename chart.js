var Chart = function(task_type, system_type) {
    this.task_type = task_type;
    this.system_type = system_type;

    this.get = function() {
        console.log(this.task_type + ' ' + this.system_type);
    }
}
